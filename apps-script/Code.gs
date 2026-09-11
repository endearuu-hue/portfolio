// Portfolio inquiry form -> the Gmail of whoever deploys this script.
// Deploy as a web app: Execute as "Me", access "Anyone". See README.md.

const LIMITS = {
  type: 10, name: 50, email: 100, phone: 30,
  date: 20, venue: 100, scope: 30,
  project: 30, budget: 30, timeline: 50,
  message: 3000,
};
const TYPE_LABEL = { photo: '웨딩 촬영', dev: '개발 의뢰', both: '촬영 + 개발' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot filled in: a bot. Answer "ok" so it doesn't retry.
  if (p.website) return json({ ok: true });

  const f = {};
  for (const key in LIMITS) {
    f[key] = String(p[key] || '').replace(/\r\n?/g, '\n').trim().slice(0, LIMITS[key]);
  }
  // Single-line fields must not carry newlines (they go into the subject line).
  ['type', 'name', 'email', 'phone', 'date', 'venue', 'scope', 'project', 'budget', 'timeline']
    .forEach(k => { f[k] = f[k].replace(/\n/g, ' '); });

  if (!f.name || !EMAIL_RE.test(f.email) || !f.message || p.consent !== 'yes' || !TYPE_LABEL[f.type]) {
    return json({ ok: false, error: 'invalid' });
  }

  const rows = [
    ['문의 유형', TYPE_LABEL[f.type]],
    ['이름', f.name],
    ['이메일', f.email],
    ['연락처', f.phone],
    ['예식일', f.date],
    ['예식 장소', f.venue],
    ['촬영 범위', f.scope],
    ['만들고 싶은 것', f.project],
    ['예산', f.budget],
    ['희망 일정', f.timeline],
  ].filter(([, v]) => v);

  const body = rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
    `\n\n문의 내용\n${f.message}\n\n개인정보 수집·이용 동의: 예\n받은 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;

  // Plain-text body: nothing the visitor types is rendered as HTML.
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    replyTo: f.email,
    subject: `[포트폴리오 문의] ${TYPE_LABEL[f.type]} · ${f.name}`,
    body: body,
  });
  return json({ ok: true });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
