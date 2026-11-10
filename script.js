/* ===== تَمَرُّن — External script (الملف الخارجي) ===== */
"use strict";

/* ---------- Helpers ---------- */
function $(id) { return document.getElementById(id); }

function saveData(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}
function loadData(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}

function setFieldState(input, ok, message) {
    var field = input.closest(".field");
    var msg = field.querySelector(".error-msg");
    field.classList.toggle("valid", ok);
    field.classList.toggle("invalid", !ok);
    if (msg) msg.textContent = ok ? "" : message;
    return ok;
}

function showFormMessage(box, type, text) {
    box.className = "form-msg " + type;
    box.textContent = text;
}

/* ---------- Mobile menu (dynamic element behaviour) ---------- */
function initMenu() {
    var btn = $("menuToggle"), nav = $("mainNav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", open);
        btn.textContent = open ? "✕" : "☰";
    });
}

/* ---------- Welcome link if a user is logged in ---------- */
function initSession() {
    var user = loadData("tamarrunSession");
    var slot = $("authLink");
    if (user && slot) {
        slot.textContent = "👤 " + user.name;
        slot.href = "about.html";
    }
}

/* ---------- Motivational quote rotator (setInterval + for loop) ---------- */
var quotes = [
    "الخطوة الأولى هي الأصعب… ابدأ اليوم.",
    "جسمك يسمع كل ما تقوله لنفسك.",
    "الانتظام يتفوّق على الحماس المؤقت.",
    "كل تمرين يقرّبك من نسختك الأقوى.",
    "لا تقارن بدايتك بنهاية غيرك."
];
function initQuotes() {
    var box = $("quoteBox");
    if (!box) return;
    var i = 0;
    setInterval(function () {
        box.style.opacity = 0;
        setTimeout(function () {
            i = (i + 1) % quotes.length;
            box.textContent = "“" + quotes[i] + "”";
            box.style.opacity = 1;
        }, 400);
    }, 4000);
}

/* ---------- Plan data ---------- */
var DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

/* [اسم التمرين, MET, الدقائق الأساسية] */
var PLANS = {
    fat: [
        ["جري متوسط", 8.3, 40], ["HIIT", 9.5, 30], ["مشي سريع (راحة نشطة)", 3.8, 30],
        ["دراجة", 7.5, 45], ["تمارين دائرية", 8, 35], ["سباحة", 7, 40], ["راحة تامة", 0, 0]
    ],
    muscle: [
        ["صدر وترايسبس", 6, 50], ["ظهر وبايسبس", 6, 50], ["راحة تامة", 0, 0],
        ["أرجل", 6, 55], ["أكتاف وبطن", 5, 45], ["كارديو خفيف", 5, 25], ["راحة تامة", 0, 0]
    ],
    fit: [
        ["مشي سريع", 4.3, 40], ["تمارين وزن الجسم", 5, 35], ["يوغا وإطالة", 2.5, 40],
        ["دراجة", 6.8, 35], ["جري خفيف", 7, 30], ["سباحة", 6, 40], ["راحة تامة", 0, 0]
    ]
};

var LEVEL_FACTOR = { beginner: 0.75, intermediate: 1, advanced: 1.25 };

var GOAL_INFO = {
    fat: { label: "حرق الدهون", img: "hero-fat.svg", theme: "theme-fat" },
    muscle: { label: "بناء العضلات", img: "hero-muscle.svg", theme: "theme-muscle" },
    fit: { label: "اللياقة العامة", img: "hero-fit.svg", theme: "theme-fit" }
};

var TIPS = {
    fat: [
        "اشرب الماء قبل التمرين وبعده.",
        "حافظ على عجز بسيط في السعرات اليومية دون حرمان.",
        "ابدأ بإحماء 5 دقائق لتجنب الإصابة.",
        "نم 7 ساعات على الأقل، فالنوم يساعد على التحكم بالشهية."
    ],
    muscle: [
        "ارفع الأوزان تدريجياً كل أسبوع.",
        "تناول بروتيناً كافياً بعد التمرين.",
        "اترك 48 ساعة راحة للعضلة المتعبة.",
        "الأداء الصحيح للحركة أهم من الوزن الثقيل."
    ],
    fit: [
        "نوّع بين الكارديو والقوة والمرونة.",
        "التزم بالجدول حتى لو بتمارين أخفّ.",
        "خذ جولة مشي قصيرة بعد الوجبات.",
        "سجّل تقدمك أسبوعياً لتبقى متحمساً."
    ]
};

/* ---------- Dynamic picture + text when choosing a goal ---------- */
function changeGoalPreview(goal) {
    var img = $("heroImg"), badge = $("heroBadge");
    var info = GOAL_INFO[goal];
    if (!img || !info) return;
    img.style.opacity = 0;
    setTimeout(function () {
        img.src = info.img;
        img.alt = info.label;
        img.style.opacity = 1;
    }, 250);
    if (badge) badge.textContent = "🎯 هدفك: " + info.label;
}

/* ---------- Calories: MET × weight × hours ---------- */
function calcCalories(met, weightKg, minutes) {
    return Math.round(met * weightKg * (minutes / 60));
}

function buildPlan(goal, level, weight) {
    var base = PLANS[goal];
    var factor = LEVEL_FACTOR[level];
    var plan = [];
    for (var i = 0; i < base.length; i++) {
        var minutes = base[i][2] === 0 ? 0 : Math.round(base[i][2] * factor / 5) * 5;
        plan.push({
            day: DAYS[i],
            name: base[i][0],
            minutes: minutes,
            kcal: calcCalories(base[i][1], weight, minutes)
        });
    }
    return plan;
}

/* ---------- Render the result (dynamic elements) ---------- */
function renderPlan(plan, goal, level, weight, userName) {
    var tbody = $("planBody");
    tbody.innerHTML = "";

    var totalKcal = 0, totalMin = 0, activeDays = 0, maxKcal = 0;
    plan.forEach(function (d) { if (d.kcal > maxKcal) maxKcal = d.kcal; });

    for (var i = 0; i < plan.length; i++) {
        var d = plan[i];
        var tr = document.createElement("tr");
        var isRest = d.minutes === 0;
        if (isRest) tr.className = "rest"; else activeDays++;

        var pct = maxKcal ? Math.round((d.kcal / maxKcal) * 100) : 0;
        tr.innerHTML =
            "<td><strong>" + d.day + "</strong></td>" +
            "<td>" + d.name + "</td>" +
            "<td>" + (isRest ? "—" : d.minutes + " دقيقة") + "</td>" +
            "<td>" + d.kcal + "</td>" +
            '<td><div class="bar"><i style="width:' + pct + '%"></i></div></td>';
        tbody.appendChild(tr);

        totalKcal += d.kcal;
        totalMin += d.minutes;
    }

    $("statKcal").textContent = totalKcal;
    $("statMin").textContent = totalMin;
    $("statDays").textContent = activeDays;

    /* summary text using if / else if / else */
    var comment;
    if (totalKcal >= 3500) comment = "برنامج مكثّف! احرص على الراحة والتغذية الجيدة.";
    else if (totalKcal >= 2000) comment = "برنامج متوازن ومناسب لتحقيق تقدم ثابت.";
    else comment = "بداية لطيفة، ويمكنك زيادة الشدة تدريجياً.";

    var who = userName ? userName + "، " : "";
    $("summaryText").textContent =
        who + "خطتك لهدف «" + GOAL_INFO[goal].label + "» بمستوى «" + levelLabel(level) +
        "» ستحرق نحو " + totalKcal + " سعرة أسبوعياً. " + comment;

    /* tips list built with a loop */
    var ul = $("tipsList");
    ul.innerHTML = "";
    var list = TIPS[goal];
    for (var j = 0; j < list.length; j++) {
        var li = document.createElement("li");
        li.textContent = list[j];
        ul.appendChild(li);
    }

    /* change CSS via script: theme class + reveal */
    var result = $("result");
    result.className = GOAL_INFO[goal].theme;
    result.style.display = "block";
    result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function levelLabel(level) {
    switch (level) {
        case "beginner": return "مبتدئ";
        case "intermediate": return "متوسط";
        default: return "متقدم";
    }
}

/* ---------- Home form: validation + generate ---------- */
function validatePlanForm() {
    var form = $("planForm");
    var okAll = true;

    var weight = $("weight");
    var w = Number(weight.value);
    if (!weight.value || isNaN(w) || w < 30 || w > 250) {
        setFieldState(weight, false, "أدخل وزناً صحيحاً بين 30 و250 كجم.");
        okAll = false;
    } else setFieldState(weight, true);

    var level = $("level");
    if (!level.value) { setFieldState(level, false, "اختر مستوى خبرتك."); okAll = false; }
    else setFieldState(level, true);

    var goalChoice = form.querySelector('input[name="goal"]:checked');
    var goalErr = $("goalError");
    if (!goalChoice) { goalErr.textContent = "اختر هدفك الرياضي."; okAll = false; }
    else goalErr.textContent = "";

    return okAll;
}

function initPlanForm() {
    var form = $("planForm");
    if (!form) return;

    var radios = form.querySelectorAll('input[name="goal"]');
    for (var i = 0; i < radios.length; i++) {
        radios[i].addEventListener("change", function () { changeGoalPreview(this.value); });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validatePlanForm()) return;
        var goal = form.querySelector('input[name="goal"]:checked').value;
        var level = $("level").value;
        var weight = Number($("weight").value);
        var user = loadData("tamarrunSession");
        var name = $("userName").value.trim() || (user ? user.name : "");
        renderPlan(buildPlan(goal, level, weight), goal, level, weight, name);
    });

    form.addEventListener("reset", function () {
        $("result").style.display = "none";
        changeGoalPreview("fit");
        var fields = form.querySelectorAll(".field");
        for (var k = 0; k < fields.length; k++) fields[k].classList.remove("valid", "invalid");
        var errs = form.querySelectorAll(".error-msg");
        for (var m = 0; m < errs.length; m++) errs[m].textContent = "";
    });
}

/* ---------- Auth helpers ---------- */
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordScore(pw) {
    var score = 0;
    var checks = [/.{8,}/, /[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].test(pw)) score++;
    }
    return score;
}

function initShowPassword() {
    var cb = $("showPw");
    if (!cb) return;
    cb.addEventListener("change", function () {
        var inputs = document.querySelectorAll('input[data-pw]');
        for (var i = 0; i < inputs.length; i++) inputs[i].type = cb.checked ? "text" : "password";
    });
}

/* ---------- Sign-up ---------- */
function initSignup() {
    var form = $("signupForm");
    if (!form) return;

    $("password").addEventListener("input", function () {
        var s = passwordScore(this.value);
        var bar = $("strengthBar"), txt = $("strengthText");
        var colors = ["#c0392b", "#c0392b", "#e67e22", "#d4a017", "#7cb342", "#1e8a4c"];
        var labels = ["", "ضعيفة جداً", "ضعيفة", "متوسطة", "جيدة", "قوية"];
        bar.style.width = (s * 20) + "%";
        bar.style.background = colors[s];
        txt.textContent = this.value ? "قوة كلمة المرور: " + labels[s] : "";
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true;
        var name = $("fullName"), email = $("email"), pw = $("password"),
            pw2 = $("confirm"), age = $("age");

        if (name.value.trim().length < 3) ok = setFieldState(name, false, "الاسم لا يقل عن 3 أحرف.") && ok;
        else setFieldState(name, true);

        if (!EMAIL_RE.test(email.value.trim())) ok = setFieldState(email, false, "صيغة البريد الإلكتروني غير صحيحة.") && ok;
        else setFieldState(email, true);

        if (passwordScore(pw.value) < 3 || pw.value.length < 8) ok = setFieldState(pw, false, "8 أحرف على الأقل مع حروف وأرقام.") && ok;
        else setFieldState(pw, true);

        if (pw2.value !== pw.value || !pw2.value) ok = setFieldState(pw2, false, "كلمتا المرور غير متطابقتين.") && ok;
        else setFieldState(pw2, true);

        var a = Number(age.value);
        if (!age.value || a < 12 || a > 90) ok = setFieldState(age, false, "العمر يجب أن يكون بين 12 و90.") && ok;
        else setFieldState(age, true);

        var terms = $("terms"), msg = $("formMsg");
        if (!terms.checked) { ok = false; $("termsError").textContent = "يجب الموافقة على الشروط."; }
        else $("termsError").textContent = "";

        if (!ok) { showFormMessage(msg, "err", "يرجى تصحيح الحقول المظللة."); return; }

        var users = loadData("tamarrunUsers") || [];
        var exists = false;
        for (var i = 0; i < users.length; i++) {
            if (users[i].email === email.value.trim().toLowerCase()) exists = true;
        }
        if (exists) { showFormMessage(msg, "err", "هذا البريد مسجّل مسبقاً، جرّب تسجيل الدخول."); return; }

        users.push({ name: name.value.trim(), email: email.value.trim().toLowerCase(), password: pw.value });
        saveData("tamarrunUsers", users);
        showFormMessage(msg, "ok", "تم إنشاء حسابك بنجاح! سيتم نقلك لصفحة الدخول…");
        setTimeout(function () { window.location.href = "login.html"; }, 1800);
    });
}

/* ---------- Login ---------- */
function initLogin() {
    var form = $("loginForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = $("email"), pw = $("password"), msg = $("formMsg");
        var ok = true;

        if (!EMAIL_RE.test(email.value.trim())) ok = setFieldState(email, false, "أدخل بريداً إلكترونياً صحيحاً.") && ok;
        else setFieldState(email, true);

        if (pw.value.length < 6) ok = setFieldState(pw, false, "كلمة المرور 6 أحرف على الأقل.") && ok;
        else setFieldState(pw, true);

        if (!ok) { showFormMessage(msg, "err", "تحقق من البيانات المدخلة."); return; }

        var users = loadData("tamarrunUsers") || [];
        var found = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].email === email.value.trim().toLowerCase() && users[i].password === pw.value) {
                found = users[i]; break;
            }
        }
        if (!found) { showFormMessage(msg, "err", "البريد أو كلمة المرور غير صحيحة. هل أنشأت حساباً؟"); return; }

        saveData("tamarrunSession", { name: found.name, email: found.email });
        showFormMessage(msg, "ok", "أهلاً " + found.name + "! جارٍ تحويلك للرئيسية…");
        setTimeout(function () { window.location.href = "index.html#customize"; }, 1500);
    });
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSession();
    initQuotes();
    initPlanForm();
    initSignup();
    initLogin();
    initShowPassword();
});