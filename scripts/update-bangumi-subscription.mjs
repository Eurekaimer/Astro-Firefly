import fs from 'node:fs/promises';
import path from 'node:path';

const userId = process.env.BANGUMI_USER_ID;
if (!userId) {
  console.error('Missing BANGUMI_USER_ID env var.');
  process.exit(1);
}

const apiUrl = 'https://api.bgm.tv';
const limit = 50;
const keywords = ['漫画', 'manga', 'comic', 'comics', 'manhua', 'manhwa'];

const normalize = (value = '') => value.toLowerCase().trim();
const isManga = (item) => {
  const tags = [
    ...(item.tags || []),
    ...((item.subject?.tags || []).map((tag) => tag.name) || []),
  ].map(normalize);
  const subjectName = normalize(`${item.subject?.name_cn || ''} ${item.subject?.name || ''}`);

  return (
    tags.some((tag) => keywords.some((key) => tag.includes(key))) ||
    keywords.some((key) => subjectName.includes(key))
  );
};

async function fetchBooks() {
  let offset = 0;
  let all = [];

  while (true) {
    const url = `${apiUrl}/v0/users/${userId}/collections?subject_type=1&limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YuuOuRou Blog',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Bangumi API failed: ${response.status}`);
    }

    const json = await response.json();
    const batch = json.data || [];
    all = all.concat(batch);

    if (batch.length < limit) break;
    offset += limit;
  }

  return all;
}

const books = await fetchBooks();
const data = books
  .filter((item) => item.type === 3)
  .filter(isManga)
  .slice(0, 12)
  .map((item) => ({
    subjectId: item.subject.id,
    name: item.subject.name_cn || item.subject.name,
    url: `https://bgm.tv/subject/${item.subject.id}`,
    progressVol: item.vol_status || 0,
    totalVol: item.subject.volumes || 0,
  }));

const output = {
  userId,
  updatedAt: new Date().toISOString(),
  total: data.length,
  items: data,
};

const outputPath = path.join(process.cwd(), 'src/data/bangumi-manga-progress.json');
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Updated ${outputPath} with ${data.length} items.`);
