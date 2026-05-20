
        function initChart() {
            const container = document.getElementById('dailyChart');
            if (!container) return;
            // Данные за 7 дней
            const dailyData = [12450, 18230, 21340, 19870, 25400, 31200, 29800];
            const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
            const maxVal = Math.max(...dailyData);
            
            container.innerHTML = '';
            dailyData.forEach((value, idx) => {
                const barHeight = (value / maxVal) * 200; // max 200px
                const barDiv = document.createElement('div');
                barDiv.className = 'bar-item';
                barDiv.innerHTML = 
                    <div class="bar" style="height: ${barHeight}px; background: var(--ACCENT);"></div>;
                    <div class="bar-label">${days[idx]}</div>;
                    <div class="bar-label" style="color: white;">${value.toLocaleString()}</div>;
                ;
                container.appendChild(barDiv);
            });
        }

        // Эмуляция переключения периода (только для вида - меняем текст в карточках)
        const periodBtns = document.querySelectorAll('.period-btn');
        const statValues = document.querySelectorAll('.stat-value');
        const topTableBody = document.querySelector('.stats-table tbody');
        const platformPercent = document.querySelectorAll('.platform-percent');
        const progressFills = document.querySelectorAll('.progress-fill');
        
        function updateDemoData(period) {
            // Простая симуляция изменения данных для "вида"
                if (period === 'НЕДЕЛЯ') {
                if (statValues[0]) statValues[0].innerText = '184 293';
                if (statValues[1]) statValues[1].innerText = '12 847';
                if (statValues[2]) statValues[2].innerText = '$ 1 428';
                if (statValues[3]) statValues[3].innerText = '7';
                // обновим таблицу топ треков
                if (topTableBody) {
                    topTableBody.innerHTML = 
                        <tr><td>Сумерки в Петербурге</td><td>42 891</td><td>$334</td></tr>;
                        <tr><td>Neon Drive</td><td>38 204</td><td>$298</td></tr>;
                        <tr><td>Космос внутри</td><td>29 543</td><td>$221</td></tr>;
                        <tr><td>Midnight Express</td><td>21 899</td><td>$167</td></tr>;
                        <tr><td>Эхо любви</td><td>18 432</td><td>$139</td></tr>;
                }
                if (platformPercent.length) {
                    const newPerc = ['41%', '28%', '15%', '10%', '4%', '2%'];
                    platformPercent.forEach((el, i) => { if(newPerc[i]) el.innerText = newPerc[i]; });
                    if(progressFills.length) {
                        progressFills[0].style.width = '41%';
                        progressFills[1].style.width = '28%';
                        progressFills[2].style.width = '15%';
                        progressFills[3].style.width = '10%';
                        progressFills[4].style.width = '4%';
                        progressFills[5].style.width = '2%';
                    }
                }
                // Баланс
                const balanceDiv = document.querySelector('.balance');
                if(balanceDiv) balanceDiv.innerText = '$ 1 428.30';
                // Изменяем гео-проценты тоже для динамики
                const geoBadges = document.querySelectorAll('.geo-badge');
                if(geoBadges.length) {
                    geoBadges[0].innerHTML = '🇷🇺 Россия · 63%';
                    geoBadges[1].innerHTML = '🇺🇸 США · 14%';
                }
            } else if (period === 'МЕСЯЦ') {
                if (statValues[0]) statValues[0].innerText = '702 881';
                if (statValues[1]) statValues[1].innerText = '41 203';
                if (statValues[2]) statValues[2].innerText = '$ 5 376';
                if (statValues[3]) statValues[3].innerText = '7';
                if (topTableBody) {
                    topTableBody.innerHTML = 
                        <tr><td>Neon Drive</td><td>158 902</td><td>$1 240</td></tr>;
                        <tr><td>Сумерки в Петербурге</td><td>147 328</td><td>$1 149</td></tr>;
                        <tr><td>Космос внутри</td><td>112 543</td><td>$877</td></tr>;
                        <tr><td>Midnight Express</td><td>89 204</td><td>$695</td></tr>;
                        <tr><td>Эхо любви</td><td>74 109</td><td>$578</td></tr>;
                    ;
                }
                if (platformPercent.length) {
                    const newPerc = ['39%', '30%', '16%', '9%', '4%', '2%'];
                    platformPercent.forEach((el, i) => { if(newPerc[i]) el.innerText = newPerc[i]; });
                    if(progressFills.length) {
                        progressFills[0].style.width = '39%';
                        progressFills[1].style.width = '30%';
                        progressFills[2].style.width = '16%';
                        progressFills[3].style.width = '9%';
                        progressFills[4].style.width = '4%';
                        progressFills[5].style.width = '2%';
                    }
                }
                const balanceDiv = document.querySelector('.balance');
                if(balanceDiv) balanceDiv.innerText = '$ 5 376.80';
                const geoBadges = document.querySelectorAll('.geo-badge');
                    if(geoBadges.length) {
                    geoBadges[0].innerHTML = '🇷🇺 Россия · 58%';
                    geoBadges[1].innerHTML = '🇺🇸 США · 18%';
                }
            } else if (period === 'ГОД') {
                if (statValues[0]) statValues[0].innerText = '6 413 912';
                if (statValues[1]) statValues[1].innerText = '189 432';
                if (statValues[2]) statValues[2].innerText = '$ 48 221';
                if (statValues[3]) statValues[3].innerText = '7';
                if (topTableBody) {
                    topTableBody.innerHTML = 
                        <tr><td>Сумерки в Петербурге</td><td>1 920 483</td><td>$14 904</td></tr>;
                        <tr><td>Neon Drive</td><td>1 812 404</td><td>$14 057</td></tr>;
                        <tr><td>Космос внутри</td><td>1 234 521</td><td>$9 581</td></tr>;
                        <tr><td>Midnight Express</td><td>892 013</td><td>$6 922</td></tr>;
                        <tr><td>Сборник 2025</td><td>554 491</td><td>$4 300</td></tr>;
                }
                if (platformPercent.length) {
                    const newPerc = ['43%', '26%', '14%', '11%', '4%', '2%'];
                    platformPercent.forEach((el, i) => { if(newPerc[i]) el.innerText = newPerc[i]; });
                    if(progressFills.length) {
                        progressFills[0].style.width = '43%';
                        progressFills[1].style.width = '26%';
                        progressFills[2].style.width = '14%';
                        progressFills[3].style.width = '11%';
                        progressFills[4].style.width = '4%';
                        progressFills[5].style.width = '2%';
                    }
                }
                const balanceDiv = document.querySelector('.balance');
                if(balanceDiv) balanceDiv.innerText = '$ 48 221.00';
                const geoBadges = document.querySelectorAll('.geo-badge');
                if(geoBadges.length) {
                    geoBadges[0].innerHTML = '🇷🇺 Россия · 61%';
                    geoBadges[1].innerHTML = '🇺🇸 США · 16%';
                }
            }

        }

        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                periodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const periodText = btn.innerText.trim();
                updateDemoData(periodText);
            });
        });
        
        // запускаем график и базовые данные
        initChart();
        
        // Также подправим таблицу эффективности релизов и доход от площадок, чтоб немного адаптировать под периоды (но оставим статичной для простоты)
        // Дополнительно: при клике на кнопку выплаты показываем уведомление (используем существующую систему нотификаций)
        const withdrawBtn = document.querySelector('.money-block .BUTTON_INTERNATIONAL');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Эмулируем уведомление
                let notif = document.getElementById('notification');
                if (!notif) {
                    notif = document.createElement('div');
                    notif.id = 'notification';
                    notif.className = 'notification';
                    document.body.appendChild(notif);
                }
                notif.innerText = 'ЗАПРОС НА ВЫПЛАТУ ОТПРАВЛЕН (ДЕМО-РЕЖИМ)';
                notif.classList.add('show', 'success');
                setTimeout(() => {
                    notif.classList.remove('show');
                }, 3000);
            });
        }

        // Для страницы скролл уже есть
