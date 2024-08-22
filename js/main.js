const file = "./csv/prefectures_surnames.csv";

async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    fetch(file)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            console.log("パース結果", results);
            resolve(results.data);
          },
          error: () => {
            reject(new Error("CSV読み込み失敗"));
          },
        });
      })
      .catch(() => {
        reject(new Error("ファイル取得失敗"));
      });
  });
}

const displayMatchTable = (data) => {
  const surnameCounts = {};

  data.forEach((row) => {
    const prefecture = row["都道府県"];
    const surname = row["名字"];

    if (!surnameCounts[surname]) {
      surnameCounts[surname] = new Set();
    }

    if (prefecture && surname) {
      // データが存在するか確認
      surnameCounts[surname].add(prefecture);
    }
  });

  // 各名字がどれだけの都道府県に存在するかを計算
  const totalPrefectures = 47;
  const surnameRankings = Object.entries(surnameCounts).map(
    ([surname, prefectures]) => {
      const percentage = (prefectures.size / totalPrefectures) * 100;
      return { surname, percentage: percentage.toFixed(2) };
    }
  );

  // 出現数でソートして上位3位を抽出
  surnameRankings.sort((a, b) => b.percentage - a.percentage);
  const topSurnames = surnameRankings.slice(0, 3);

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const thSurname = document.createElement("th");
  const thPercentage = document.createElement("th");

  thSurname.textContent = "名字";
  thPercentage.textContent = "割合";

  headerRow.appendChild(thSurname);
  headerRow.appendChild(thPercentage);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  topSurnames.forEach(({ surname, percentage }) => {
    const tr = document.createElement("tr");
    const tdSurname = document.createElement("td");
    const tdPercentage = document.createElement("td");

    tdSurname.textContent = surname;
    tdPercentage.textContent = `${percentage}% `;

    tr.appendChild(tdSurname);
    tr.appendChild(tdPercentage);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  document.querySelector(".contents").appendChild(table);
};
async function initialize() {
  try {
    const data = await parseCSV(file);
    console.log("読み込んだcsvデータ", data);

    document.getElementById("display").addEventListener("click", () => {
      displayMatchTable(data);
    });
  } catch (error) {
    console.error(error);
  }
}

initialize();
