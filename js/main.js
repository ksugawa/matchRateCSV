const file = "csv/prefectures_surnames.csv";

const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: () => {
        reject(new Error("csv読み込み失敗"));
      },
    });
  });
};

const displayMatchTable = (data) => {
  const surnameCounts = {};

  data.forEach((row) => {
    const prefecture = row["都道府県"];
    const surname = row["名字"];

    if (!surnameCounts[surname]) {
      surnameCounts[surname] = new Set();
    }

    surnameCounts[surname].add(prefecture);
  });

  // 各名字がどれだけの都道府県に存在するかを計算
  const surnameRankings = Object.entries(surnameCounts).map(([surname, prefectures]) => {
    return { surname, count: prefectures.size };
  });

  // 出現数でソートして上位3位を抽出
  surnameRankings.sort((a, b) => b.count - a.count);
  const topSurnames = surnameRankings.slice(0, 3);

  const table = document.createAttribute("table");
  topSurnames.forEach(({ surname, count }) => {
    const tr = document.createElement('tr');
    const tdSurname = document.createElement('td');
    const tdCount = document.createElement('td');

    tdSurname.textContent = surname;
    tdCount.textContent = `${count} `;

    tr.appendChild(tdSurname);
    tr.appendChild(tdCount);
    table.appendChild(tr);
  });

  document.querySelector('.contents').appendChild(table);
};

try {
  const data = await parseCSV(file);
  console.log("読み込んだcsvデータ", +data);
  document.getElementById("display").addEventListener("click", () => {
    displayMatchTable(data);
  });
} catch (error) {
  console.error(error);
}
