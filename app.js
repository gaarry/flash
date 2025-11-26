/**
 * 宇宙漩涡 - 3D 粒子系统
 * 数学之美：在多种经典曲线之间无缝穿越
 */

class ParticleSystem {
    constructor() {
        // 核心组件
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.particles = null;
        this.particleGeometry = null;
        this.particleMaterial = null;
        this.cosmicDust = null;
        
        // 配置
        this.config = {
            particleCount: 30000,
            particleSize: 2.5,
            color: new THREE.Color(0x00f5d4),
            currentModel: 0,
            spreadFactor: 1.0,
            targetSpread: 1.0,
            scaleFactor: 1.0,
            targetScale: 1.0,
            rotationSpeed: 0,
            targetRotation: 0,
            gestureSensitivity: 5.0,
            autoSwitch: true,
            switchInterval: 8000,  // 8秒自动切换
            transitionProgress: 0,
            transitionSpeed: 0.015
        };
        
        // 数学曲线列表
        this.curveNames = [
            'lissajous',      // 利萨茹曲线
            'heart',          // 心形线
            'butterfly',      // 蝴蝶曲线
            'archimedean',    // 阿基米德螺旋线
            'catenary',       // 悬链线
            'lemniscate',     // 伯努利双扭线
            'rose',           // 玫瑰曲线
            'torusKnot',      // 环面纽结
            'lorenz',         // 洛伦兹吸引子
            'galaxy'          // 银河漩涡
        ];
        
        this.curveDisplayNames = {
            lissajous: '利萨茹曲线',
            heart: '心形线',
            butterfly: '蝴蝶曲线',
            archimedean: '阿基米德螺旋',
            catenary: '悬链线',
            lemniscate: '双扭线',
            rose: '玫瑰曲线',
            torusKnot: '环面纽结',
            lorenz: '洛伦兹吸引子',
            galaxy: '银河漩涡'
        };
        
        // 模型数据缓存
        this.modelPositions = {};
        this.currentPositions = null;
        this.targetPositions = null;
        this.nextModelIndex = 0;
        
        // 手势检测
        this.hands = null;
        this.videoElement = null;
        this.handCanvas = null;
        this.handCtx = null;
        this.isCameraActive = false;
        this.gestureValue = 0;
        
        // 动画
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.lastSwitchTime = 0;
        this.fps = 60;
        
        // 鼠标交互
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        
        // UI 状态
        this.isUIHidden = false;
        
        this.init();
    }
    
    async init() {
        this.setupScene();
        this.setupParticles();
        this.setupCosmicBackground();
        this.setupEventListeners();
        this.setupUI();
        
        // 隐藏加载界面
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            this.showToast('✨ 宇宙漩涡已启动 - 数学之美');
        }, 1500);
        
        this.animate();
    }
    
    setupScene() {
        const container = document.getElementById('canvas-container');
        
        // 场景
        this.scene = new THREE.Scene();
        
        // 相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );
        this.camera.position.z = 600;
        
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000008, 1);
        container.appendChild(this.renderer.domElement);
    }
    
    setupCosmicBackground() {
        // 创建宇宙尘埃背景
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 5000;
        const dustPositions = new Float32Array(dustCount * 3);
        const dustColors = new Float32Array(dustCount * 3);
        const dustSizes = new Float32Array(dustCount);
        
        for (let i = 0; i < dustCount; i++) {
            // 球形分布
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 800 + Math.random() * 1500;
            
            dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            dustPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            dustPositions[i * 3 + 2] = r * Math.cos(phi);
            
            // 随机颜色（蓝紫色调）
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
                dustColors[i * 3] = 0.2 + Math.random() * 0.3;
                dustColors[i * 3 + 1] = 0.3 + Math.random() * 0.4;
                dustColors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else if (colorChoice < 0.6) {
                dustColors[i * 3] = 0.6 + Math.random() * 0.4;
                dustColors[i * 3 + 1] = 0.2 + Math.random() * 0.3;
                dustColors[i * 3 + 2] = 0.7 + Math.random() * 0.3;
            } else {
                dustColors[i * 3] = 0.9 + Math.random() * 0.1;
                dustColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
                dustColors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
            }
            
            dustSizes[i] = 0.5 + Math.random() * 2;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
        dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
        
        const dustMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    // 缓慢旋转
                    float angle = time * 0.02;
                    float cosA = cos(angle);
                    float sinA = sin(angle);
                    pos.xz = mat2(cosA, -sinA, sinA, cosA) * pos.xz;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (400.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - dist * 2.0;
                    alpha = pow(alpha, 2.0) * 0.6;
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.cosmicDust = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(this.cosmicDust);
        
        // 添加星云效果
        this.addNebula();
    }
    
    addNebula() {
        // 创建多层星云
        const nebulaColors = [
            { r: 0.1, g: 0.2, b: 0.5 },
            { r: 0.3, g: 0.1, b: 0.4 },
            { r: 0.05, g: 0.15, b: 0.3 }
        ];
        
        nebulaColors.forEach((color, index) => {
            const geometry = new THREE.PlaneGeometry(3000, 3000);
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(color.r, color.g, color.b) },
                    offset: { value: index * 1.5 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    uniform float offset;
                    varying vec2 vUv;
                    
                    // 简化的噪声函数
                    float noise(vec2 p) {
                        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                    }
                    
                    float fbm(vec2 p) {
                        float f = 0.0;
                        float w = 0.5;
                        for (int i = 0; i < 4; i++) {
                            f += w * noise(p);
                            p *= 2.0;
                            w *= 0.5;
                        }
                        return f;
                    }
                    
                    void main() {
                        vec2 uv = vUv - 0.5;
                        float dist = length(uv);
                        
                        float n = fbm(uv * 3.0 + time * 0.05 + offset);
                        float alpha = (1.0 - dist * 1.5) * n * 0.15;
                        alpha = max(0.0, alpha);
                        
                        gl_FragColor = vec4(color, alpha);
                    }
                `,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            
            const nebula = new THREE.Mesh(geometry, material);
            nebula.position.z = -1000 - index * 200;
            nebula.userData.nebulaIndex = index;
            this.scene.add(nebula);
        });
    }
    
    setupParticles() {
        // 生成所有数学曲线的位置数据
        this.generateAllCurvePositions();
        
        // 创建粒子几何体
        this.particleGeometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(this.config.particleCount * 3);
        const sizes = new Float32Array(this.config.particleCount);
        const randoms = new Float32Array(this.config.particleCount);
        const delays = new Float32Array(this.config.particleCount);
        
        // 初始化为第一个曲线
        const firstCurve = this.curveNames[0];
        const modelPos = this.modelPositions[firstCurve];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            positions[i * 3] = modelPos[i * 3];
            positions[i * 3 + 1] = modelPos[i * 3 + 1];
            positions[i * 3 + 2] = modelPos[i * 3 + 2];
            
            sizes[i] = this.config.particleSize * (0.3 + Math.random() * 0.7);
            randoms[i] = Math.random();
            delays[i] = Math.random(); // 用于错开动画时间
        }
        
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.particleGeometry.setAttribute('random', new THREE.BufferAttribute(randoms, 1));
        this.particleGeometry.setAttribute('delay', new THREE.BufferAttribute(delays, 1));
        
        this.currentPositions = positions.slice();
        this.targetPositions = positions.slice();
        
        // 创建着色器材质
        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointSize: { value: this.config.particleSize },
                spreadFactor: { value: this.config.spreadFactor },
                scaleFactor: { value: this.config.scaleFactor },
                uColor: { value: this.config.color },
                transitionProgress: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute float random;
                attribute float delay;
                
                uniform float time;
                uniform float pointSize;
                uniform float spreadFactor;
                uniform float scaleFactor;
                uniform float transitionProgress;
                
                varying vec3 vColor;
                varying float vRandom;
                varying float vDepth;
                varying float vGlow;
                
                // HSL to RGB 转换
                vec3 hsl2rgb(float h, float s, float l) {
                    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
                    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
                    float m = l - c / 2.0;
                    vec3 rgb;
                    if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
                    else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
                    else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
                    else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
                    else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
                    else rgb = vec3(c, 0.0, x);
                    return rgb + m;
                }
                
                void main() {
                    vRandom = random;
                    
                    vec3 pos = position;
                    
                    // 应用缩放
                    pos *= scaleFactor;
                    
                    // 添加有机波动
                    float posLen = length(pos);
                    if (posLen > 0.001) {
                        float wave1 = sin(time * 1.5 + random * 6.28 + delay * 3.14) * 4.0;
                        float wave2 = cos(time * 0.8 + posLen * 0.02) * 3.0;
                        pos += normalize(pos) * (wave1 + wave2) * spreadFactor;
                    }
                    
                    // 螺旋运动
                    float spiralAngle = time * 0.3 + posLen * 0.01 + random * 6.28;
                    float spiralRadius = 2.0 * spreadFactor;
                    pos.x += cos(spiralAngle) * spiralRadius;
                    pos.z += sin(spiralAngle) * spiralRadius;
                    
                    // 扩散效果
                    pos *= 1.0 + (spreadFactor - 1.0) * 0.5;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // 深度感
                    vDepth = -mvPosition.z / 1000.0;
                    
                    // 动态颜色 - 基于位置和时间
                    float hue = mod(time * 0.05 + posLen * 0.002 + random * 0.3, 1.0);
                    float saturation = 0.7 + 0.3 * sin(time + random * 6.28);
                    float lightness = 0.5 + 0.2 * vDepth;
                    vColor = hsl2rgb(hue, saturation, lightness);
                    
                    // 粒子大小 - 远处更小，近处更大
                    float depthScale = 500.0 / max(-mvPosition.z, 1.0);
                    float pulseScale = 1.0 + 0.2 * sin(time * 3.0 + random * 6.28);
                    gl_PointSize = size * pointSize * depthScale * scaleFactor * pulseScale;
                    
                    vGlow = 0.8 + spreadFactor * 0.4 + 0.2 * sin(time * 2.0 + random * 6.28);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vRandom;
                varying float vDepth;
                varying float vGlow;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    // 多层发光效果
                    float core = 1.0 - smoothstep(0.0, 0.15, dist);
                    float inner = 1.0 - smoothstep(0.0, 0.3, dist);
                    float outer = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    // 组合发光
                    float glow = core * 1.0 + inner * 0.6 + outer * 0.3;
                    glow *= vGlow;
                    
                    // 颜色增强
                    vec3 finalColor = vColor * glow;
                    
                    // 添加白色核心
                    finalColor += vec3(core * 0.5);
                    
                    // 深度雾效
                    float fog = exp(-vDepth * 0.5);
                    finalColor *= fog;
                    
                    gl_FragColor = vec4(finalColor, glow * 0.85);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.scene.add(this.particles);
    }
    
    generateAllCurvePositions() {
        const count = this.config.particleCount;
        
        this.curveNames.forEach(name => {
            this.modelPositions[name] = this.generateCurvePositions(name, count);
        });
    }
    
    generateCurvePositions(curveName, count) {
        const positions = new Float32Array(count * 3);
        const scale = 150;
        
        for (let i = 0; i < count; i++) {
            let x, y, z;
            const t = (i / count) * Math.PI * 2;
            const t2 = Math.random() * Math.PI * 2;
            const noise = (Math.random() - 0.5) * 0.1;
            
            switch (curveName) {
                case 'lissajous':
                    // 利萨茹曲线 - 3D版本
                    const a = 3, b = 4, c = 5;
                    const delta = Math.PI / 2;
                    x = Math.sin(a * t + delta) * (1 + noise);
                    y = Math.sin(b * t) * (1 + noise);
                    z = Math.sin(c * t) * 0.5 * (1 + noise);
                    break;
                    
                case 'heart':
                    // 3D 心形线
                    const ht = t;
                    x = 16 * Math.pow(Math.sin(ht), 3) * 0.08;
                    y = (13 * Math.cos(ht) - 5 * Math.cos(2*ht) - 2 * Math.cos(3*ht) - Math.cos(4*ht)) * 0.08;
                    z = Math.sin(t2) * Math.sin(ht) * 0.3 * (1 + noise);
                    break;
                    
                case 'butterfly':
                    // 蝴蝶曲线
                    const bt = t * 6;
                    const r_b = Math.exp(Math.cos(bt)) - 2 * Math.cos(4 * bt) - Math.pow(Math.sin(bt / 12), 5);
                    x = Math.sin(bt) * r_b * 0.3 * (1 + noise);
                    y = Math.cos(bt) * r_b * 0.3 * (1 + noise);
                    z = Math.sin(bt * 0.5) * 0.3 * (1 + noise);
                    break;
                    
                case 'archimedean':
                    // 阿基米德螺旋线 - 3D螺旋
                    const at = t * 4;
                    const ar = 0.1 + at * 0.05;
                    x = ar * Math.cos(at) * (1 + noise);
                    y = ar * Math.sin(at) * (1 + noise);
                    z = at * 0.1 * (1 + noise);
                    break;
                    
                case 'catenary':
                    // 悬链线 - 旋转曲面
                    const ct = (i / count - 0.5) * 6;
                    const cr = Math.cosh(ct) * 0.3;
                    x = cr * Math.cos(t2) * (1 + noise);
                    y = ct * 0.3 * (1 + noise);
                    z = cr * Math.sin(t2) * (1 + noise);
                    break;
                    
                case 'lemniscate':
                    // 伯努利双扭线 - 3D版本
                    const lt = t;
                    const cos_lt = Math.cos(lt);
                    const denom = 1 + Math.sin(lt) * Math.sin(lt);
                    x = cos_lt / denom * (1 + noise);
                    y = Math.sin(lt) * cos_lt / denom * (1 + noise);
                    z = Math.sin(t2) * 0.3 / denom * (1 + noise);
                    break;
                    
                case 'rose':
                    // 玫瑰曲线 - 3D版本
                    const k = 5; // 花瓣数
                    const rt = t;
                    const rr = Math.cos(k * rt);
                    x = rr * Math.cos(rt) * (1 + noise);
                    y = rr * Math.sin(rt) * (1 + noise);
                    z = Math.sin(k * rt * 0.5) * 0.3 * (1 + noise);
                    break;
                    
                case 'torusKnot':
                    // 环面纽结
                    const p = 3, q = 7;
                    const phi = t * p;
                    const theta = t * q;
                    const tr = 0.5 + 0.3 * Math.cos(theta);
                    x = tr * Math.cos(phi) * (1 + noise);
                    y = tr * Math.sin(phi) * (1 + noise);
                    z = 0.3 * Math.sin(theta) * (1 + noise);
                    break;
                    
                case 'lorenz':
                    // 洛伦兹吸引子（简化版）
                    const sigma = 10, rho = 28, beta = 8/3;
                    let lx = 0.1, ly = 0, lz = 0;
                    const steps = Math.floor((i / count) * 5000);
                    const dt = 0.005;
                    for (let s = 0; s < steps; s++) {
                        const dx = sigma * (ly - lx);
                        const dy = lx * (rho - lz) - ly;
                        const dz = lx * ly - beta * lz;
                        lx += dx * dt;
                        ly += dy * dt;
                        lz += dz * dt;
                    }
                    x = lx * 0.03 + noise * 0.5;
                    y = ly * 0.03 + noise * 0.5;
                    z = (lz - 25) * 0.03 + noise * 0.5;
                    break;
                    
                case 'galaxy':
                    // 银河漩涡
                    const arms = 4;
                    const arm = Math.floor(Math.random() * arms);
                    const armAngle = (arm / arms) * Math.PI * 2;
                    const distance = Math.pow(Math.random(), 0.5);
                    const angle = armAngle + distance * 4 + (Math.random() - 0.5) * 0.5;
                    x = distance * Math.cos(angle) * (1 + noise);
                    y = (Math.random() - 0.5) * 0.15 * (1 - distance) * (1 + noise);
                    z = distance * Math.sin(angle) * (1 + noise);
                    break;
            }
            
            positions[i * 3] = x * scale;
            positions[i * 3 + 1] = y * scale;
            positions[i * 3 + 2] = z * scale;
        }
        
        return positions;
    }
    
    switchToNextCurve() {
        this.nextModelIndex = (this.config.currentModel + 1) % this.curveNames.length;
        const nextCurve = this.curveNames[this.nextModelIndex];
        const targetPos = this.modelPositions[nextCurve];
        
        // 设置目标位置
        for (let i = 0; i < this.config.particleCount * 3; i++) {
            this.targetPositions[i] = targetPos[i];
        }
        
        this.config.currentModel = this.nextModelIndex;
        this.config.transitionProgress = 0;
        
        // 更新UI
        this.updateCurveDisplay();
        
        return this.curveDisplayNames[nextCurve];
    }
    
    switchToCurve(index) {
        if (index < 0 || index >= this.curveNames.length) return;
        
        const curveName = this.curveNames[index];
        const targetPos = this.modelPositions[curveName];
        
        for (let i = 0; i < this.config.particleCount * 3; i++) {
            this.targetPositions[i] = targetPos[i];
        }
        
        this.config.currentModel = index;
        this.config.transitionProgress = 0;
        this.lastSwitchTime = performance.now();
        
        this.updateCurveDisplay();
        this.showToast(`切换到 ${this.curveDisplayNames[curveName]}`);
    }
    
    updateCurveDisplay() {
        const curveName = this.curveNames[this.config.currentModel];
        const displayName = this.curveDisplayNames[curveName];
        
        // 更新所有曲线按钮的状态
        document.querySelectorAll('.curve-btn').forEach((btn, index) => {
            btn.classList.toggle('active', index === this.config.currentModel);
        });
        
        // 更新当前曲线名称显示
        const nameDisplay = document.getElementById('currentCurveName');
        if (nameDisplay) {
            nameDisplay.textContent = displayName;
        }
    }
    
    updateColor(hexColor) {
        this.config.color = new THREE.Color(hexColor);
        this.particleMaterial.uniforms.uColor.value = this.config.color;
    }
    
    updateParticleCount(count) {
        this.config.particleCount = count;
        
        this.scene.remove(this.particles);
        this.particleGeometry.dispose();
        this.particleMaterial.dispose();
        
        this.generateAllCurvePositions();
        this.setupParticles();
        
        document.getElementById('particleStatsValue').textContent = count;
    }
    
    updateParticleSize(size) {
        this.config.particleSize = size;
        this.particleMaterial.uniforms.pointSize.value = size;
    }
    
    // 手势检测相关
    async setupHandDetection() {
        this.videoElement = document.getElementById('video');
        this.handCanvas = document.getElementById('handCanvas');
        this.handCtx = this.handCanvas.getContext('2d');
        
        this.showToast('正在加载手势识别模型...');
        
        try {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
                }
            });
            
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.hands.onResults((results) => this.onHandResults(results));
            
            await this.hands.initialize();
            console.log('MediaPipe Hands 模型已加载');
        } catch (error) {
            console.error('MediaPipe 初始化失败:', error);
            this.showToast('手势模型加载失败');
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                }
            });
            
            this.videoElement.srcObject = stream;
            
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => resolve();
            });
            
            await this.videoElement.play();
            
            this.handCanvas.width = this.videoElement.videoWidth || 640;
            this.handCanvas.height = this.videoElement.videoHeight || 480;
            
            this.isCameraActive = true;
            document.getElementById('cameraDot').classList.add('active');
            this.showToast('摄像头已开启，请伸出手掌控制粒子');
            
            this.detectHands();
            
        } catch (error) {
            console.error('摄像头访问失败:', error);
            this.showToast('无法访问摄像头，请检查权限设置');
        }
    }
    
    async detectHands() {
        if (!this.isCameraActive) return;
        
        try {
            if (this.videoElement.readyState >= 2) {
                await this.hands.send({ image: this.videoElement });
            }
        } catch (error) {
            console.error('手势检测错误:', error);
        }
        
        requestAnimationFrame(() => this.detectHands());
    }
    
    onHandResults(results) {
        this.handCtx.clearRect(0, 0, this.handCanvas.width, this.handCanvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            this.drawHandLandmarks(landmarks);
            
            const sensitivity = this.config.gestureSensitivity;
            
            // 1. 张合程度 → 扩散
            const openness = this.calculateHandOpenness(landmarks);
            this.gestureValue = openness;
            document.getElementById('gestureValue').textContent = Math.round(openness * 100) + '%';
            document.getElementById('gestureIndicator').classList.add('active');
            
            const adjustedOpenness = Math.pow(openness, 1 / sensitivity);
            this.config.targetSpread = 0.2 + adjustedOpenness * 3.8;
            
            // 2. 远近 → 缩放
            const distance = this.calculateHandDistance(landmarks);
            document.getElementById('distanceValue').textContent = Math.round(distance * 100) + '%';
            
            const adjustedDistance = Math.pow(distance, 1 / (sensitivity * 0.5));
            this.config.targetScale = 0.3 + adjustedDistance * 2.0;
            
            // 3. 旋转 → 转动
            const rotation = this.calculateHandRotation(landmarks);
            const rotationDeg = Math.round(rotation * 180 / Math.PI);
            document.getElementById('rotationValue').textContent = rotationDeg + '°';
            
            this.config.targetRotation = rotation * sensitivity * 0.3;
            
        } else {
            document.getElementById('gestureIndicator').classList.remove('active');
            this.config.targetSpread = 1.0;
            this.config.targetScale = 1.0;
            this.config.targetRotation = 0;
        }
    }
    
    drawHandLandmarks(landmarks) {
        const ctx = this.handCtx;
        const width = this.handCanvas.width;
        const height = this.handCanvas.height;
        
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];
        
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.6)';
        ctx.lineWidth = 2;
        
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            ctx.beginPath();
            ctx.moveTo(startPoint.x * width, startPoint.y * height);
            ctx.lineTo(endPoint.x * width, endPoint.y * height);
            ctx.stroke();
        }
        
        ctx.fillStyle = '#ff006e';
        for (const point of landmarks) {
            ctx.beginPath();
            ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    calculateHandOpenness(landmarks) {
        const wrist = landmarks[0];
        const fingertips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
        const fingerBases = [landmarks[2], landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
        
        let totalOpenness = 0;
        
        for (let i = 0; i < 5; i++) {
            const tip = fingertips[i];
            const base = fingerBases[i];
            
            const tipDist = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
            const baseDist = Math.sqrt(Math.pow(base.x - wrist.x, 2) + Math.pow(base.y - wrist.y, 2));
            
            const openness = Math.min(tipDist / (baseDist * 2), 1);
            totalOpenness += openness;
        }
        
        return totalOpenness / 5;
    }
    
    calculateHandDistance(landmarks) {
        const wrist = landmarks[0];
        const indexBase = landmarks[5];
        const middleBase = landmarks[9];
        const pinkyBase = landmarks[17];
        
        const width1 = Math.sqrt(
            Math.pow(indexBase.x - pinkyBase.x, 2) + 
            Math.pow(indexBase.y - pinkyBase.y, 2)
        );
        
        const height = Math.sqrt(
            Math.pow(wrist.x - middleBase.x, 2) + 
            Math.pow(wrist.y - middleBase.y, 2)
        );
        
        const palmSize = (width1 + height) / 2;
        const normalized = Math.max(0, Math.min(1, (palmSize - 0.08) / 0.35));
        
        return normalized;
    }
    
    calculateHandRotation(landmarks) {
        const wrist = landmarks[0];
        const middleBase = landmarks[9];
        
        const dx1 = middleBase.x - wrist.x;
        const dy1 = middleBase.y - wrist.y;
        
        let angle = Math.atan2(dx1, -dy1);
        return angle;
    }
    
    stopHandDetection() {
        this.isCameraActive = false;
        
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
        
        document.getElementById('cameraDot').classList.remove('active');
        document.getElementById('gestureIndicator').classList.remove('active');
        document.getElementById('gestureValue').textContent = '--';
        document.getElementById('distanceValue').textContent = '--';
        document.getElementById('rotationValue').textContent = '--';
        
        this.config.targetSpread = 1.0;
        this.config.targetScale = 1.0;
        this.config.targetRotation = 0;
        
        this.showToast('摄像头已关闭');
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        });
        
        document.addEventListener('wheel', (e) => {
            this.camera.position.z += e.deltaY * 0.5;
            this.camera.position.z = Math.max(200, Math.min(1500, this.camera.position.z));
        });
    }
    
    setupUI() {
        // 曲线选择按钮
        document.querySelectorAll('.curve-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.switchToCurve(index);
                this.config.autoSwitch = false;
                document.getElementById('autoSwitch').checked = false;
            });
        });
        
        // 自动切换开关
        const autoSwitchToggle = document.getElementById('autoSwitch');
        if (autoSwitchToggle) {
            autoSwitchToggle.checked = this.config.autoSwitch;
            autoSwitchToggle.addEventListener('change', (e) => {
                this.config.autoSwitch = e.target.checked;
                if (e.target.checked) {
                    this.lastSwitchTime = performance.now();
                    this.showToast('已开启自动切换');
                }
            });
        }
        
        // 颜色选择器
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('input', (e) => {
            this.updateColor(e.target.value);
            document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
        });
        
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.updateColor(color);
                colorPicker.value = color;
                document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            });
        });
        
        // 粒子数量滑块
        const particleCountSlider = document.getElementById('particleCount');
        particleCountSlider.addEventListener('input', (e) => {
            document.getElementById('particleCountValue').textContent = e.target.value;
        });
        particleCountSlider.addEventListener('change', (e) => {
            this.updateParticleCount(parseInt(e.target.value));
        });
        
        // 粒子大小滑块
        const particleSizeSlider = document.getElementById('particleSize');
        particleSizeSlider.addEventListener('input', (e) => {
            document.getElementById('particleSizeValue').textContent = e.target.value;
            this.updateParticleSize(parseFloat(e.target.value));
        });
        
        // 手势灵敏度滑块
        const sensitivitySlider = document.getElementById('sensitivity');
        sensitivitySlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('sensitivityValue').textContent = value + 'x';
            this.config.gestureSensitivity = value;
        });
        
        // 摄像头按钮
        const cameraBtn = document.getElementById('cameraBtn');
        const cameraPreview = document.getElementById('cameraPreview');
        
        cameraBtn.addEventListener('click', () => {
            if (this.isCameraActive) {
                this.stopHandDetection();
                cameraPreview.style.display = 'none';
                cameraBtn.classList.remove('active');
            } else {
                this.setupHandDetection();
                cameraPreview.style.display = 'block';
                cameraBtn.classList.add('active');
            }
        });
        
        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.camera.position.set(0, 0, 600);
            this.targetRotationX = 0;
            this.targetRotationY = 0;
            this.config.targetSpread = 1.0;
            this.config.targetScale = 1.0;
            this.showToast('视图已重置');
        });
        
        // 全屏按钮
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        });
        
        // 隐藏 UI 按钮
        const hideUIBtn = document.getElementById('hideUIBtn');
        const controlPanel = document.getElementById('controlPanel');
        const togglePanelBtn = document.getElementById('togglePanel');
        
        hideUIBtn.addEventListener('click', () => {
            this.isUIHidden = !this.isUIHidden;
            
            if (this.isUIHidden) {
                controlPanel.classList.add('hidden');
                togglePanelBtn.classList.add('visible');
                hideUIBtn.textContent = '👁️‍🗨️';
            } else {
                controlPanel.classList.remove('hidden');
                togglePanelBtn.classList.remove('visible');
                hideUIBtn.textContent = '👁️';
            }
        });
        
        togglePanelBtn.addEventListener('click', () => {
            controlPanel.classList.remove('hidden');
            togglePanelBtn.classList.remove('visible');
            this.isUIHidden = false;
            hideUIBtn.textContent = '👁️';
        });
        
        // 初始化显示
        this.updateCurveDisplay();
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        const now = performance.now();
        
        // 更新 FPS
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (now - this.lastTime));
            document.getElementById('fpsValue').textContent = this.fps;
            this.frameCount = 0;
            this.lastTime = now;
        }
        
        // 自动切换曲线
        if (this.config.autoSwitch && now - this.lastSwitchTime > this.config.switchInterval) {
            const curveName = this.switchToNextCurve();
            this.showToast(`✨ ${curveName}`);
            this.lastSwitchTime = now;
        }
        
        // 平滑更新所有参数
        this.config.spreadFactor += (this.config.targetSpread - this.config.spreadFactor) * 0.08;
        this.config.scaleFactor += (this.config.targetScale - this.config.scaleFactor) * 0.08;
        this.config.rotationSpeed += (this.config.targetRotation - this.config.rotationSpeed) * 0.05;
        
        // 更新着色器 uniforms
        this.particleMaterial.uniforms.spreadFactor.value = this.config.spreadFactor;
        this.particleMaterial.uniforms.scaleFactor.value = this.config.scaleFactor;
        this.particleMaterial.uniforms.time.value = time;
        
        // 更新宇宙尘埃
        if (this.cosmicDust) {
            this.cosmicDust.material.uniforms.time.value = time;
        }
        
        // 更新星云
        this.scene.children.forEach(child => {
            if (child.userData.nebulaIndex !== undefined) {
                child.material.uniforms.time.value = time;
            }
        });
        
        // 平滑过渡粒子位置
        const positions = this.particleGeometry.attributes.position.array;
        const delays = this.particleGeometry.attributes.delay.array;
        
        for (let i = 0; i < this.config.particleCount; i++) {
            const delay = delays[i];
            const transitionSpeed = 0.03 + delay * 0.02; // 错开过渡速度
            
            positions[i * 3] += (this.targetPositions[i * 3] - positions[i * 3]) * transitionSpeed;
            positions[i * 3 + 1] += (this.targetPositions[i * 3 + 1] - positions[i * 3 + 1]) * transitionSpeed;
            positions[i * 3 + 2] += (this.targetPositions[i * 3 + 2] - positions[i * 3 + 2]) * transitionSpeed;
        }
        this.particleGeometry.attributes.position.needsUpdate = true;
        
        // 鼠标和手势控制旋转
        this.targetRotationY += (this.mouseX * 0.5 - this.targetRotationY) * 0.03;
        this.targetRotationX += (this.mouseY * 0.3 - this.targetRotationX) * 0.03;
        
        const baseRotation = time * 0.08;
        const gestureRotation = this.config.rotationSpeed;
        
        this.particles.rotation.y = this.targetRotationY + baseRotation + gestureRotation;
        this.particles.rotation.x = this.targetRotationX + Math.sin(time * 0.2) * 0.1;
        this.particles.rotation.z = Math.sin(gestureRotation) * 0.2 + Math.sin(time * 0.15) * 0.05;
        
        // 渲染
        this.renderer.render(this.scene, this.camera);
    }
}

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});

