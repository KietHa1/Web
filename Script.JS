const ADMIN_PASSWORD = 'admin123';
const storageKey = 'videoCodeMap';
const mappings = JSON.parse(localStorage.getItem(storageKey) || '{}');

const codeInput = document.getElementById('codeInput');
const showBtn = document.getElementById('showBtn');
const videoWrap = document.getElementById('videoWrap');
const msg = document.getElementById('msg');

const adminPanel = document.getElementById('adminPanel');
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminCode = document.getElementById('adminCode');
const adminLink = document.getElementById('adminLink');
const saveBtn = document.getElementById('saveBtn');
const listWrap = document.getElementById('listWrap');
const adminMsg = document.getElementById('adminMsg');

// Chuẩn hóa link Youtube thành dạng embed
function normalizeYoutubeLink(link) {
  const ytMatch = link.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
}
// Kiểm tra link có phải mp4/webm/ogg ko
function isMp4(link) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(link);
}

function loadVideo() {
  const code = codeInput.value.trim();
  videoWrap.innerHTML = '';
  videoWrap.style.display = 'none';
  msg.textContent = '';
  if (!code) {
    msg.textContent = 'Nhập mã trước đã!';
    return;
  }
  if (!mappings[code]) {
    msg.textContent = 'Mã không tồn tại';
    return;
  }
  const link = mappings[code];
  const ytEmbed = normalizeYoutubeLink(link);
  if (ytEmbed) {
    videoWrap.innerHTML = `<iframe src="${ytEmbed}" frameborder="0" allowfullscreen></iframe>`;
  } else if (isMp4(link)) {
    videoWrap.innerHTML = `<video controls><source src="${link}"></video>`;
  } else {
    videoWrap.innerHTML = `<div style="color:white;text-align:center;padding-top:20px">Không thể hiển thị</div>`;
  }
  videoWrap.style.display = 'block';
}

function saveMapping() {
  const code = adminCode.value.trim();
  const link = adminLink.value.trim();
  adminMsg.textContent = '';
  if (!code || !link) {
    adminMsg.textContent = 'Cần mã và link';
    return;
  }
  mappings[code] = link;
  localStorage.setItem(storageKey, JSON.stringify(mappings));
  adminCode.value = '';
  adminLink.value = '';
  adminMsg.textContent = 'Đã lưu.';
  renderList();
  setTimeout(() => adminMsg.textContent = '', 1200);
}

function deleteMapping(code) {
  if (!confirm(`Xóa mã "${code}"?`)) return;
  delete mappings[code];
  localStorage.setItem(storageKey, JSON.stringify(mappings));
  renderList();
}

function renderList() {
  const entries = Object.entries(mappings);
  if (entries.length === 0) {
    listWrap.innerHTML = '<div class="text-muted">Chưa có mã nào.</div>';
    return;
  }
  listWrap.innerHTML = entries.map(([k,v]) => `
    <div class="mapping">
      <div>
        <strong>${escapeHtml(k)}</strong><br/>
        <small style="color:#666; word-break: break-word;">${escapeHtml(v)}</small>
      </div>
      <div class="mapping-buttons">
        <button class="small-btn gray" onclick="chooseCode('${encodeURIComponent(k)}')">Chọn</button>
        <button class="small-btn" onclick="copyLink('${encodeURIComponent(v)}')">Copy</button>
        <button class="small-btn warn" onclick="deleteCode('${encodeURIComponent(k)}')">Xóa</button>
      </div>
    </div>
  `).join('');
}

// Các hàm toàn cục để gọi trong html
window.chooseCode = function(encodedK) {
  codeInput.value = decodeURIComponent(encodedK);
  loadVideo();
};
window.copyLink = function(encodedV) {
  navigator.clipboard.writeText(decodeURIComponent(encodedV));
  adminMsg.textContent = 'Đã copy';
  setTimeout(() => adminMsg.textContent = '', 1000);
};
window.deleteCode = function(encodedK) {
  deleteMapping(decodeURIComponent(encodedK));
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}

// Xử lý bật/tắt admin panel khi bấm nút
adminToggleBtn.addEventListener('click', () => {
  if (!adminPanel.classList.contains('open')) {
    const pass = prompt('Nhập admin password:');
    if (pass === null) return; // hủy prompt
    if (pass === ADMIN_PASSWORD) {
      adminPanel.classList.add('open');
      adminPanel.style.display = 'block';
      adminCode.focus();
      renderList();
    } else {
      alert('Sai mật khẩu');
    }
  } else {
    adminPanel.classList.remove('open');
    adminPanel.style.display = 'none';
  }
});

saveBtn.addEventListener('click', saveMapping);
showBtn.addEventListener('click', loadVideo);

videoWrap.style.display = 'none';

// Nếu chưa có mapping mặc định thì tạo demo
if (Object.keys(mappings).length === 0) {
  mappings['demo'] = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  localStorage.setItem(storageKey, JSON.stringify(mappings));
}
