const file = "./csv/prefectures_surnames.csv";
let prefectureSet = new Set();
let surnameCounts = {};

const regionCategories = {
  hokkaido: ["北海道"],
  tohoku: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  kanto: [
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
  ],
  chubu: [
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
  ],
  kinki: [
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
  ],
  chugokuShikoku: [
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
  ],
  kyushu: [
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ],
};

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

const displayMatchTable = () => {
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
    tdPercentage.textContent = `${percentage}%` ;

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

    data.forEach((row) => {
      const prefecture = row["都道府県"];
      const surname = row["名字"];

      if (!surnameCounts[surname]) {
        surnameCounts[surname] = new Set();
      }

      if (prefecture && surname) {
        surnameCounts[surname].add(prefecture);
        prefectureSet.add(prefecture);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("display").addEventListener("click", () => {
  displayMatchTable();
});

const openModal = () => {
  document.getElementById("regionModal").style.display = "block";
  createCheckboxes();

};

const closeModal = () => {
  document.getElementById("regionModal").style.display = "none";
};
const filterRegions = (selectedCategory) => {
  const selectedPrefectures = regionCategories[selectedCategory] || [];
  const checkboxContainer = document.getElementById("checkboxContainer");
  // checkboxContainer.innerHTML = ""; // 既存のチェックボックスをクリア

  const checkboxes = Array.from(
    document.querySelectorAll('#checkboxContainer input[type="checkbox"]')
  );

  checkboxes.forEach((checkbox) => {
    const label = document.querySelector(`label[for="${checkbox.value}"]`);

    if (selectedPrefectures.includes(checkbox.value)) {
      checkbox.disabled = false; // チェック可能にする
      label.style.color = ""; // デフォルトの色に戻す
    } else {
      checkbox.disabled = true; // チェックできないようにする
      label.style.color = "#ccc"; // テキストカラーを#cccに変更する
    }
  });

};

const createCheckboxes = (prefecture, surname) => {
  const h4 = document.createElement('h4');
  h4.textContent = '中カテゴリ';

  const checkboxContainer = document.getElementById("checkboxContainer");
  checkboxContainer.innerHTML = ""; // 既存のチェックボックスをクリア

  checkboxContainer.appendChild(h4);

  if (prefecture && surname) {
    // データが存在するか確認
    surnameCounts[surname].add(prefecture);
    prefectureSet.add(prefecture);
  }

  prefectureSet.forEach((prefecture) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = prefecture;
    checkbox.id = prefecture;

    const label = document.createElement("label");
    label.htmlFor = prefecture;
    label.textContent = prefecture;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    checkboxContainer.appendChild(document.createElement("br"));
  });
};

initialize();
