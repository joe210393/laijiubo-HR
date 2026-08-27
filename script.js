// 全域變數
let logoBase64 = '';
let stampBase64 = '';
let logoImage = null; // 儲存圖片物件以便取得尺寸
let stampImage = null; // 儲存圖片物件以便取得尺寸
let productCounter = 0;

// 保存公司資訊到 localStorage
function saveCompanyInfo() {
    const companyData = {
        companyName: document.getElementById('companyName').value,
        companyAddress: document.getElementById('companyAddress').value,
        companyPhone: document.getElementById('companyPhone').value,
        companyTaxId: document.getElementById('companyTaxId').value,
        logoBase64: logoBase64,
        stampBase64: stampBase64
    };
    localStorage.setItem('quoteCompanyInfo', JSON.stringify(companyData));
}

// 從 localStorage 載入公司資訊
function loadCompanyInfo() {
    const saved = localStorage.getItem('quoteCompanyInfo');
    if (saved) {
        try {
            const companyData = JSON.parse(saved);
            if (companyData.companyName) {
                document.getElementById('companyName').value = companyData.companyName;
            }
            if (companyData.companyAddress) {
                document.getElementById('companyAddress').value = companyData.companyAddress;
            }
            if (companyData.companyPhone) {
                document.getElementById('companyPhone').value = companyData.companyPhone;
            }
            if (companyData.companyTaxId) {
                document.getElementById('companyTaxId').value = companyData.companyTaxId;
            }
            if (companyData.logoBase64) {
                logoBase64 = companyData.logoBase64;
                const logoPreview = document.getElementById('logoPreview');
                logoPreview.innerHTML = `<img src="${logoBase64}" alt="預覽">`;
                const img = new Image();
                img.onload = function() {
                    logoImage = img;
                };
                img.src = logoBase64;
            }
            if (companyData.stampBase64) {
                stampBase64 = companyData.stampBase64;
                const stampPreview = document.getElementById('stampPreview');
                stampPreview.innerHTML = `<img src="${stampBase64}" alt="預覽">`;
                const img = new Image();
                img.onload = function() {
                    stampImage = img;
                };
                img.src = stampBase64;
            }
        } catch (e) {
            console.error('載入公司資訊失敗：', e);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 載入保存的公司資訊
    loadCompanyInfo();
    
    // 設定預設日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
    
    // 生成報價單編號
    const quoteNumber = 'QT-' + new Date().getFullYear() + '-' + 
                       String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    document.getElementById('quoteNumber').value = quoteNumber;
    
    // 設定有效期限（預設30天後）
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    document.getElementById('validUntil').value = validDate.toISOString().split('T')[0];
    
    // Logo上傳處理
    document.getElementById('logoUpload').addEventListener('change', function(e) {
        handleImageUpload(e, 'logoPreview', function(base64) {
            logoBase64 = base64;
            saveCompanyInfo(); // 自動保存
            updateQuotePreview();
        });
    });
    
    // 發票章上傳處理
    document.getElementById('stampUpload').addEventListener('change', function(e) {
        handleImageUpload(e, 'stampPreview', function(base64) {
            stampBase64 = base64;
            saveCompanyInfo(); // 自動保存
            updateQuotePreview();
        });
    });
    
    // 綁定公司資訊輸入框的變化事件（自動保存）
    const companyFields = ['companyName', 'companyAddress', 'companyPhone', 'companyTaxId'];
    companyFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                saveCompanyInfo(); // 自動保存
                updateQuotePreview();
            });
            field.addEventListener('change', function() {
                saveCompanyInfo(); // 自動保存
                updateQuotePreview();
            });
        }
    });
    
    // 綁定其他輸入框的變化事件來更新預覽
    const otherFields = [
        'customerName', 'customerContact', 'customerPhone', 'customerTaxId',
        'quoteNumber', 'quoteDate', 'validUntil'
    ];
    
    otherFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateQuotePreview);
            field.addEventListener('change', updateQuotePreview);
        }
    });
    
    // 初始化預覽
    updateQuotePreview();
    
    // 稅率選擇變更時重新計算
    document.querySelectorAll('input[name="taxType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const rows = document.querySelectorAll('#productsBody tr');
            rows.forEach(row => {
                const quantityInput = row.querySelector('.product-quantity');
                if (quantityInput) {
                    calculateRow(quantityInput);
                }
            });
        });
    });
    
    // 新增第一筆商品
    addProduct();
});

// 圖片上傳處理
function handleImageUpload(event, previewId, callback) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            const preview = document.getElementById(previewId);
            
            // 創建圖片物件以取得尺寸
            const img = new Image();
            img.onload = function() {
                // 保持正方形顯示，固定150x150
                preview.innerHTML = `<img src="${base64}" alt="預覽">`;
                
                // 保存圖片物件
                if (previewId === 'logoPreview') {
                    logoImage = img;
                } else if (previewId === 'stampPreview') {
                    stampImage = img;
                }
                
                callback(base64);
            };
            img.src = base64;
        };
        reader.readAsDataURL(file);
    }
}

// 新增商品
function addProduct() {
    productCounter++;
    const tbody = document.getElementById('productsBody');
    const row = document.createElement('tr');
    row.id = `product-${productCounter}`;
    
    row.innerHTML = `
        <td>${productCounter}</td>
        <td><input type="text" class="product-name" placeholder="品項名稱"></td>
        <td><input type="number" class="product-quantity" value="1" min="1" onchange="calculateRow(this)"></td>
        <td><input type="number" class="product-price" value="0" min="0" step="0.01" onchange="calculateRow(this)"></td>
        <td class="amount-exclude">0</td>
        <td class="amount-tax">0</td>
        <td class="amount-include">0</td>
        <td><button type="button" class="btn btn-delete" onclick="deleteProduct(${productCounter})">刪除</button></td>
    `;
    
    tbody.appendChild(row);
    
    // 綁定輸入事件
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'text' || input.type === 'number') {
            input.addEventListener('input', function() {
                if (input.classList.contains('product-quantity') || 
                    input.classList.contains('product-price')) {
                    calculateRow(input);
                }
            });
        }
    });
}

// 刪除商品
function deleteProduct(id) {
    const row = document.getElementById(`product-${id}`);
    if (row) {
        row.remove();
        updateProductNumbers();
        calculateTotal();
    }
}

// 更新商品序號
function updateProductNumbers() {
    const rows = document.querySelectorAll('#productsBody tr');
    rows.forEach((row, index) => {
        row.querySelector('td:first-child').textContent = index + 1;
        row.id = `product-${index + 1}`;
        const deleteBtn = row.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.setAttribute('onclick', `deleteProduct(${index + 1})`);
        }
    });
    productCounter = rows.length;
}

// 計算單行金額
function calculateRow(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.product-price').value) || 0;
    
    const taxType = document.querySelector('input[name="taxType"]:checked').value;
    const taxRate = 0.05; // 5% 稅率
    
    let excludeAmount, taxAmount, includeAmount;
    
    if (taxType === 'include') {
        // 含稅
        includeAmount = quantity * price;
        excludeAmount = includeAmount / (1 + taxRate);
        taxAmount = includeAmount - excludeAmount;
    } else {
        // 未含稅
        excludeAmount = quantity * price;
        taxAmount = excludeAmount * taxRate;
        includeAmount = excludeAmount + taxAmount;
    }
    
    row.querySelector('.amount-exclude').textContent = formatCurrency(excludeAmount);
    row.querySelector('.amount-tax').textContent = formatCurrency(taxAmount);
    row.querySelector('.amount-include').textContent = formatCurrency(includeAmount);
    
    calculateTotal();
}

// 計算總計
function calculateTotal() {
    const rows = document.querySelectorAll('#productsBody tr');
    let subtotalExclude = 0;
    let subtotalTax = 0;
    let subtotalInclude = 0;
    
    rows.forEach(row => {
        const exclude = parseFloat(row.querySelector('.amount-exclude').textContent.replace(/,/g, '')) || 0;
        const tax = parseFloat(row.querySelector('.amount-tax').textContent.replace(/,/g, '')) || 0;
        const include = parseFloat(row.querySelector('.amount-include').textContent.replace(/,/g, '')) || 0;
        
        subtotalExclude += exclude;
        subtotalTax += tax;
        subtotalInclude += include;
    });
    
    document.getElementById('subtotalExclude').textContent = formatCurrency(subtotalExclude);
    document.getElementById('subtotalTax').textContent = formatCurrency(subtotalTax);
    document.getElementById('subtotalInclude').textContent = formatCurrency(subtotalInclude);
    
    document.getElementById('totalExclude').textContent = formatCurrency(subtotalExclude);
    document.getElementById('totalTax').textContent = formatCurrency(subtotalTax);
    document.getElementById('totalInclude').textContent = formatCurrency(subtotalInclude);
}

// 格式化金額
function formatCurrency(amount) {
    return Math.round(amount).toLocaleString('zh-TW');
}

function escapeHtml(value) {
    const text = value === null || value === undefined ? '' : String(value);
    return text.replace(/[&<>"']/g, function(char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char];
    });
}

function waitForImages(container) {
    const images = Array.from(container.querySelectorAll('img'));
    return Promise.all(images.map(function(img) {
        if (img.complete) {
            return Promise.resolve();
        }

        return new Promise(function(resolve) {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

function keepPdfSectionsTogether(container) {
    const pageHeight = container.getBoundingClientRect().width * (297 / 210);
    const pageGap = 12;

    container.querySelectorAll('.pdf-keep-together').forEach(function(section) {
        const sectionHeight = section.offsetHeight;
        if (!sectionHeight || sectionHeight >= pageHeight - pageGap * 2) {
            return;
        }

        const pageOffset = section.offsetTop % pageHeight;
        const availableHeight = pageHeight - pageOffset - pageGap;
        if (sectionHeight > availableHeight) {
            const currentMargin = parseFloat(window.getComputedStyle(section).marginTop) || 0;
            section.style.marginTop = (currentMargin + availableHeight + pageGap) + 'px';
        }
    });
}

// 更新報價單預覽
function updateQuotePreview() {
    // 更新Logo
    const quoteLogoPreview = document.getElementById('quoteLogoPreview');
    if (logoBase64) {
        quoteLogoPreview.innerHTML = `<img src="${logoBase64}" alt="Logo">`;
    } else {
        quoteLogoPreview.innerHTML = '';
    }
    
    // 更新報價公司資訊
    const companyName = document.getElementById('companyName').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const companyTaxId = document.getElementById('companyTaxId').value;
    
    document.getElementById('previewCompanyName').textContent = companyName || '';
    document.getElementById('previewCompanyAddress').textContent = companyAddress ? '地址：' + companyAddress : '';
    document.getElementById('previewCompanyPhone').textContent = companyPhone ? '電話：' + companyPhone : '';
    document.getElementById('previewCompanyTaxId').textContent = companyTaxId ? '統一編號：' + companyTaxId : '';
    
    // 更新客戶資訊
    const customerName = document.getElementById('customerName').value;
    const customerContact = document.getElementById('customerContact').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerTaxId = document.getElementById('customerTaxId').value;
    
    document.getElementById('previewCustomerName').textContent = customerName ? '公司名稱：' + customerName : '';
    document.getElementById('previewCustomerContact').textContent = customerContact ? '負責人：' + customerContact : '';
    document.getElementById('previewCustomerPhone').textContent = customerPhone ? '電話：' + customerPhone : '';
    document.getElementById('previewCustomerTaxId').textContent = customerTaxId ? '統一編號：' + customerTaxId : '';
    
    // 更新報價單編號
    const quoteNumber = document.getElementById('quoteNumber').value;
    document.getElementById('previewQuoteNumber').textContent = quoteNumber ? '報價單編號：' + quoteNumber : '';
    
    // 更新日期
    const quoteDate = document.getElementById('quoteDate').value;
    const validUntil = document.getElementById('validUntil').value;
    
    document.getElementById('previewQuoteDate').textContent = quoteDate ? '報價日期：' + quoteDate : '';
    document.getElementById('previewValidUntil').textContent = validUntil ? '有效期限：' + validUntil : '';
    
    // 更新發票章
    const quoteStampPreview = document.getElementById('quoteStampPreview');
    if (stampBase64) {
        quoteStampPreview.innerHTML = `<img src="${stampBase64}" alt="發票章">`;
    } else {
        quoteStampPreview.innerHTML = '';
    }
}

// 生成PDF（使用html2canvas完整支援中文）
async function generatePDF() {
    // 驗證必填欄位
    const companyName = document.getElementById('companyName').value;
    const customerName = document.getElementById('customerName').value;
    
    if (!companyName || !customerName) {
        alert('請填寫公司名稱和客戶公司名稱！');
        return;
    }
    
    const rows = document.querySelectorAll('#productsBody tr');
    let hasProduct = false;
    rows.forEach(row => {
        if (row.querySelector('.product-name').value) {
            hasProduct = true;
        }
    });
    
    if (!hasProduct) {
        alert('請至少新增一筆商品！');
        return;
    }
    
    // 使用html2canvas方式生成完整報價單（完整支援中文）
    await generatePDFWithCanvas();
}

// 使用html2canvas生成PDF（完整支援中文）
async function generatePDFWithCanvas() {
    // 創建一個隱藏的報價單預覽區域
    const previewDiv = document.createElement('div');
    previewDiv.id = 'pdf-preview';
    Object.assign(previewDiv.style, {
        position: 'absolute',
        left: '-9999px',
        top: '0',
        width: '210mm',
        minHeight: '297mm',
        padding: '14mm',
        backgroundColor: 'white',
        color: '#111',
        boxSizing: 'border-box',
        fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, Arial, sans-serif',
        lineHeight: '1.45'
    });
    
    const companyName = document.getElementById('companyName').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const companyTaxId = document.getElementById('companyTaxId').value;
    const customerName = document.getElementById('customerName').value;
    const customerContact = document.getElementById('customerContact').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerTaxId = document.getElementById('customerTaxId').value;
    const quoteNumber = document.getElementById('quoteNumber').value;
    const quoteDate = document.getElementById('quoteDate').value;
    const validUntil = document.getElementById('validUntil').value;
    const notes = document.getElementById('notes').value;
    
    let productsHtml = '';
    let productIndex = 0;
    const rows = document.querySelectorAll('#productsBody tr');
    rows.forEach(row => {
        const name = row.querySelector('.product-name').value || '';
        if (name) {
            productIndex++;
            const quantity = row.querySelector('.product-quantity').value || '0';
            const price = row.querySelector('.product-price').value || '0';
            const exclude = row.querySelector('.amount-exclude').textContent || '0';
            const tax = row.querySelector('.amount-tax').textContent || '0';
            const include = row.querySelector('.amount-include').textContent || '0';
            productsHtml += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 13px; vertical-align: top;">${productIndex}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 13px; vertical-align: top; overflow-wrap: anywhere;">${escapeHtml(name)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 13px; vertical-align: top;">${escapeHtml(quantity)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 13px; vertical-align: top;">${formatCurrency(parseFloat(price) || 0)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 13px; vertical-align: top;">${escapeHtml(exclude)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 13px; vertical-align: top;">${escapeHtml(tax)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 13px; vertical-align: top;">${escapeHtml(include)}</td>
                </tr>
            `;
        }
    });
    
    const totalExclude = document.getElementById('totalExclude').textContent;
    const totalTax = document.getElementById('totalTax').textContent;
    const totalInclude = document.getElementById('totalInclude').textContent;
    const headerColumns = logoBase64 ? '28mm 1fr 1fr' : '1fr 1fr';
    const logoHtml = logoBase64 ? `
        <div style="width: 26mm; height: 26mm; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: #fafafa;">
            <img src="${logoBase64}" style="width: 100%; height: 100%; object-fit: contain; object-position: center;" alt="Logo">
        </div>
    ` : '';
    const stampHtml = stampBase64 ? `
        <div style="width: 32mm; height: 32mm; border: 2px dashed #999; border-radius: 4px; padding: 2.5mm; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; background: #fafafa; box-sizing: border-box;">
            <div style="font-size: 10px; color: #999; line-height: 1.2; margin-bottom: 2mm; text-align: center; flex: 0 0 auto;">發票章</div>
            <div style="width: 100%; flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="${stampBase64}" style="display: block; max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; object-position: center;" alt="發票章">
            </div>
        </div>
    ` : '';
    const finalSectionHtml = (notes || quoteDate || validUntil || stampBase64) ? `
        <div class="pdf-keep-together" style="display: grid; grid-template-columns: 1fr auto; gap: 10mm; align-items: start; margin-top: 8mm; page-break-inside: avoid; break-inside: avoid;">
            ${notes ? `
                <div style="font-size: 13px; line-height: 1.7; overflow-wrap: anywhere; white-space: pre-wrap;">
                    <strong>備註：</strong>
                    <div>${escapeHtml(notes)}</div>
                </div>
            ` : '<div></div>'}
            ${(quoteDate || validUntil || stampBase64) ? `
                <div style="display: flex; justify-content: flex-end; align-items: flex-end; gap: 8mm;">
                    <div style="min-width: 38mm; text-align: right; font-size: 13px; color: #555; line-height: 1.8;">
                        ${quoteDate ? '<div>報價日期：' + escapeHtml(quoteDate) + '</div>' : ''}
                        ${validUntil ? '<div>有效期限：' + escapeHtml(validUntil) + '</div>' : ''}
                    </div>
                    ${stampHtml}
                </div>
            ` : ''}
        </div>
    ` : '';
    
    previewDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: ${headerColumns}; gap: 9mm; align-items: start;">
            ${logoHtml}
            <div>
                <div style="font-weight: bold; font-size: 16px; color: #667eea; margin-bottom: 5mm; border-bottom: 2px solid #667eea; padding-bottom: 2mm;">報價公司</div>
                <div style="font-size: 13px; margin-bottom: 2mm; line-height: 1.7;">${escapeHtml(companyName)}</div>
                ${companyAddress ? '<div style="font-size: 13px; margin-bottom: 2mm; line-height: 1.7;">地址：' + escapeHtml(companyAddress) + '</div>' : ''}
                ${companyPhone ? '<div style="font-size: 13px; margin-bottom: 2mm; line-height: 1.7;">電話：' + escapeHtml(companyPhone) + '</div>' : ''}
                ${companyTaxId ? '<div style="font-size: 13px; margin-bottom: 2mm; line-height: 1.7;">統一編號：' + escapeHtml(companyTaxId) + '</div>' : ''}
            </div>
            <div>
                <div style="font-weight: bold; font-size: 16px; color: #667eea; margin-bottom: 5mm; border-bottom: 2px solid #667eea; padding-bottom: 2mm;">客戶資訊</div>
                ${customerName ? '<div style="font-size: 13px; margin-bottom: 2mm; line-height: 1.7;">公司名稱：' + escapeHtml(customerName) + '</div>' : ''}
                ${customerContact ? '<div style="font-size: 13px; margin-bottom: 2mm; line-height: 1.7;">負責人：' + escapeHtml(customerContact) + '</div>' : ''}
                ${customerPhone ? '<div style="font-size: 13px; margin-bottom: 2mm; line-height: 1.7;">電話：' + escapeHtml(customerPhone) + '</div>' : ''}
                ${customerTaxId ? '<div style="font-size: 13px; margin-bottom: 2mm; line-height: 1.7;">統一編號：' + escapeHtml(customerTaxId) + '</div>' : ''}
            </div>
        </div>
        
        <div style="margin-top: 9mm; font-size: 15px; font-weight: bold;">
            <span style="color: #667eea;">報價單編號：${escapeHtml(quoteNumber)}</span>
        </div>
        
        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 8mm; font-size: 13px;">
            <colgroup>
                <col style="width: 8%;">
                <col style="width: 28%;">
                <col style="width: 9%;">
                <col style="width: 12%;">
                <col style="width: 17%;">
                <col style="width: 11%;">
                <col style="width: 15%;">
            </colgroup>
            <thead>
                <tr style="background-color: #667eea; color: white;">
                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 13px; text-align: left;">序號</th>
                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 13px; text-align: left;">品項</th>
                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 13px; text-align: left;">數量</th>
                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 13px; text-align: left;">單價</th>
                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 13px; text-align: left;">未含稅金額</th>
                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 13px; text-align: left;">稅額</th>
                    <th style="border: 1px solid #ddd; padding: 8px; font-size: 13px; text-align: left;">含稅金額</th>
                </tr>
            </thead>
            <tbody>
                ${productsHtml}
            </tbody>
        </table>
        <div style="display: flex; justify-content: flex-end; margin-top: 7mm; font-size: 13px;">
            <div style="min-width: 52mm; text-align: right; line-height: 1.9;">
                <div>未含稅總計：${escapeHtml(totalExclude)}</div>
                <div>稅額總計：${escapeHtml(totalTax)}</div>
                <div style="font-size: 17px; font-weight: bold; margin-top: 2mm;">含稅總計：${escapeHtml(totalInclude)}</div>
            </div>
        </div>
        ${finalSectionHtml}
    `;
    
    document.body.appendChild(previewDiv);
    
    try {
        // 等待圖片載入
        await waitForImages(previewDiv);
        keepPdfSectionsTogether(previewDiv);
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const canvas = await html2canvas(previewDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: previewDiv.offsetWidth,
            height: previewDiv.scrollHeight,
            windowWidth: previewDiv.scrollWidth,
            windowHeight: previewDiv.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4寬度
        const pageHeight = 297; // A4高度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // 如果內容超過一頁，添加新頁
        let heightLeft = imgHeight - pageHeight;
        let position = -pageHeight;
        
        while (heightLeft > 0.5) {
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            position -= pageHeight;
        }
        
        const quoteNumber = document.getElementById('quoteNumber').value;
        const fileName = '報價單_' + (quoteNumber || 'QUOTE') + '_' + new Date().getTime() + '.pdf';
        pdf.save(fileName);
        
        document.body.removeChild(previewDiv);
        alert('PDF報價單已生成並下載！');
    } catch (error) {
        console.error('生成PDF失敗：', error);
        document.body.removeChild(previewDiv);
        alert('生成PDF時發生錯誤，請重試。');
    }
}

// 清除所有資料（保留公司資訊）
function clearAll() {
    if (confirm('確定要清除所有資料嗎？（公司資訊、Logo和發票章會保留）')) {
        // 只清除客戶資訊和商品資訊，保留公司資訊
        document.getElementById('customerName').value = '';
        document.getElementById('customerContact').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerTaxId').value = '';
        document.getElementById('notes').value = '';
        
        // 清除商品列表
        document.getElementById('productsBody').innerHTML = '';
        productCounter = 0;
        
        // 重置日期和編號
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('quoteDate').value = today;
        const quoteNumber = 'QT-' + new Date().getFullYear() + '-' + 
                           String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        document.getElementById('quoteNumber').value = quoteNumber;
        
        const validDate = new Date();
        validDate.setDate(validDate.getDate() + 30);
        document.getElementById('validUntil').value = validDate.toISOString().split('T')[0];
        
        // 重新新增一筆商品
        addProduct();
        
        // 重置總計
        calculateTotal();
        
        // 更新預覽
        updateQuotePreview();
        
        alert('資料已清除！（公司資訊已保留）');
    }
}
