import { secondSection, firstSection } from "./render.js";
import { renderAuditData } from "./render.js";
import { renderSkillData } from "./render.js";
import { showAuthFormLogin } from "./script.js";

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
  const fname = res.data.user[0].firstName || "doesn't exist";
  const lname = res.data.user[0].lastName || "doesn't exist";
  const rawamount = res.data.transaction_aggregate.aggregate.sum.amount || 0;
  let amount = (rawamount / 1000).toFixed(0) + "kB";
  const campus = res.data.user[0].campus || "doesn't exist";
  const region = res.data.user[0].attrs.addressRegion || "doesn't exist";
  const country = res.data.user[0].attrs.country || "doesn't exist";
  const PhoneNumber = res.data.user[0].attrs.tel || "doesn't exist";
  const cin = res.data.user[0].attrs.cin || "doesn't exist";
  const profileimage =
    "https://discord.zone01oujda.ma//assets/pictures/" + login + ".jpg";

  firstSection(login, fname, lname, profileimage, PhoneNumber, cin);

  secondSection(email, amount, campus, region,country );
}


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
  let validated = succes / tottal_filtered_audits.length || 0;
  let failed = fail / tottal_filtered_audits.length || 0;
  const winrate = (validated * 100).toFixed(1) + "%" || "0%";
  const loserate = (failed * 100).toFixed(1) + "%" || "0%";
  const total_audits = tottal_filtered_audits.length || 0;
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
