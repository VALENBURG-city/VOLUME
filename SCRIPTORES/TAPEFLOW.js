    
    (function() {
        const tape = document.querySelector('.TAPE');
        const container = document.querySelector('.inscriptions');
        
        if (!tape || !container) return;
        
        let percent = 0;              
        let speed = 3;               
        let targetSpeed = 8;         
        let lastTime = null;
        let animFrame = null;
        
        
        let scrollDistance = 0;
        
        function updateDimensions() {
            const textWidth = container.scrollWidth;
            const containerWidth = tape.clientWidth;
            scrollDistance = textWidth - containerWidth;
            if (scrollDistance <= 0) scrollDistance = textWidth * 0.5;
        }
        
        tape.addEventListener('mouseenter', () => {
            targetSpeed = 1;  
        });
        
        tape.addEventListener('mouseleave', () => {
            targetSpeed = 8;    
        });
        
        function animate(now) {
            if (!lastTime) {
                lastTime = now;
                animFrame = requestAnimationFrame(animate);
                return;
            }
            
            const delta = Math.min(0.033, (now - lastTime) / 1000);
            lastTime = now;
            
            
            speed = speed * 0.92 + targetSpeed * 0.08;
            
            
            percent += speed * delta;
            
            
            if (percent >= 100) {
                percent -= 100;
            }
            
            updateDimensions();
            const translateX = -(scrollDistance * (percent / 100));
            container.style.transform = `translateX(${translateX}px)`;
            
            animFrame = requestAnimationFrame(animate);
        }
        
        window.addEventListener('resize', () => {
            updateDimensions();
        });
        
        updateDimensions();
        animFrame = requestAnimationFrame(animate);
    })();
