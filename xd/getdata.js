import { renderUserInfo, renderUserProfile } from "./render.js";
import { renderAuditData } from "./render.js";
import { renderSkillData } from "./render.js";
import { showAuthFormLogin } from "./script.js";
import { showNotification } from "./utils.js";
//--------------------- DATA QUERY
export async function Getcredontial() {
  const query_data = `
    {
  user{
    login
    lastName
    firstName
    email
    campus
    attrs
  } 
    transaction_aggregate(
            where: {
                type: { _eq: "xp" }
                event: { object: { name: { _eq: "Module" } } }
            }
        ) {
        aggregate {
            sum {
                amount
            }
        }
        }
}
  `;

  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    showAuthFormLogin();
    const root = document.getElementById("root");
    root.innerHTML = "";
    return;
  }
  const response = await fetch(
    "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query: query_data }),
    }
  );
  const res = await response.json();
  if (res.errors != null) {
    localStorage.clear();
    const root = document.getElementById("root");
    root.innerHTML = "";
    showAuthFormLogin();
    return;
  }
  const login = res.data.user[0].login;
  const email = res.data.user[0].email;
  const fname = res.data.user[0].firstName;
  const lname = res.data.user[0].lastName;
  const rawamount = res.data.transaction_aggregate.aggregate.sum.amount;
  let amount = (rawamount / 1000).toFixed(0) + "kB";
  const campus = res.data.user[0].campus;
  const region = res.data.user[0].attrs.addressRegion;
  const profileimage =
    "https://discord.zone01oujda.ma//assets/pictures/" + login + ".jpg";
  //  checkImageAvailability("thatim", (isAvailable) => {
  //   if (isAvailable) {
  //     console.log("Image exists");
  //   } else {
  //     console.log("Image not found");
  //   }
  // });

  if (campus == null) {
    localStorage.clear();
    const root = document.getElementById("root");
    root.innerHTML = "";
    showAuthFormLogin();
    showNotification("the user is not enrolled in the module right now");
    return;
  }

  console.log(profileimage);

  renderUserProfile(
    login,
    fname,
    lname,
    profileimage
  );

  renderUserInfo(email, amount, campus, region)
}
// function checkImageAvailability(login, callback) {
//   const img = new Image();
//   img.onload = () => callback(true);   // Image loaded (200)
//   img.onerror = () => callback(false); // Image failed (404 or blocked)
//   img.src = `https://discord.zone01oujda.ma/assets/pictures/${login}.jpg`;
// }

//---------------------- AUDIT QUERY
export async function Getauditdata() {
  const audit_query = `
    {
  user {
    audits {   
      grade
  }
}
}
  `;
  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    const root = document.getElementById("root");
    root.innerHTML = "";
    showAuthFormLogin();
    return;
  }
  const response = await fetch(
    "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query: audit_query }),
    }
  );

  const res = await response.json();
  if (res.errors != null) {
    localStorage.clear();
    const root = document.getElementById("root");
    root.innerHTML = "";
    showAuthFormLogin();
    return;
  }
  const tottal_filtered_audits = res.data.user[0].audits.filter(
    (audit) => audit.grade !== null
  );
  let succes = 0;
  let fail = 0;
  tottal_filtered_audits.forEach((e) => {
    if (e.grade >= 1) {
      succes++;
    } else {
      fail++;
    }
  });
  const winrate =
    ((succes / tottal_filtered_audits.length) * 100).toFixed(1) + "%";
  const loserate =
    ((fail / tottal_filtered_audits.length) * 100).toFixed(1) + "%";
  const total_audits = tottal_filtered_audits.length;
  renderAuditData(total_audits, succes, fail, winrate, loserate);
  Getskillsdata();
}

export async function Getskillsdata() {
  const graph_query = `
                {
  transaction(
    where: {
      type: {_ilike: "%skill%"}
    }
    order_by: {amount: desc}
  ) {
    type
    amount
  }
}
      `;
  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    const root = document.getElementById("root");
    root.innerHTML = "";
    showAuthFormLogin();
    return;
  }
  const response = await fetch(
    "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query: graph_query }),
    }
  );
  const res = await response.json();
  if (res.errors != null) {
    localStorage.clear();
    const root = document.getElementById("root");
    root.innerHTML = "";
    showAuthFormLogin();
    return;
  }
  let ok = deduplicateByHighestAmount(res.data.transaction);
  // console.log(ok)
  renderSkillData(ok);
}

function deduplicateByHighestAmount(arr) {
  const map = new Map();

  for (const item of arr) {
    if (!map.has(item.type) || map.get(item.type).amount < item.amount) {
      map.set(item.type, item);
    }
  }

  return Array.from(map.values());
}
