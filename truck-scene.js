// Shiptix — animated 3D delivery-truck hero scene (Three.js via CDN)
import * as THREE from "https://esm.sh/three@0.160.0"

export function initTruckScene(canvas) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(7, 3.8, 9)
  camera.lookAt(0, 0.9, 0)

  // ---- Lights ----
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffe0c2, 0.95))
  const key = new THREE.DirectionalLight(0xffffff, 1.9)
  key.position.set(6, 11, 6)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 1
  key.shadow.camera.far = 48
  key.shadow.camera.left = -14
  key.shadow.camera.right = 14
  key.shadow.camera.top = 14
  key.shadow.camera.bottom = -14
  key.shadow.bias = -0.0004
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xf97316, 0.45)
  rim.position.set(-7, 4, -5)
  scene.add(rim)

  // ---- Materials ----
  const matBody = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.05 })
  const matCab = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.42, metalness: 0.05 })
  const matStripe = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.4 })
  const matGlass = new THREE.MeshStandardMaterial({ color: 0x9fc3e8, roughness: 0.08, metalness: 0.35 })
  const matTire = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
  const matHub = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.3 })
  const matLight = new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xffcc55, emissiveIntensity: 0.6 })

  // ---- Truck ----
  const truck = new THREE.Group()

  const cargo = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 2.0), matBody)
  cargo.position.set(-0.5, 1.45, 0)
  cargo.castShadow = true
  truck.add(cargo)

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.42, 0.42, 2.02), matStripe)
  stripe.position.set(-0.5, 1.05, 0)
  truck.add(stripe)

  // logo mark panel on the side of the cargo box
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.04), matStripe)
  mark.position.set(-0.5, 1.75, 1.02)
  truck.add(mark)
  const markInner = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.06), matBody)
  markInner.position.set(-0.5, 1.75, 1.03)
  truck.add(markInner)

  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.7, 2.0), matCab)
  cab.position.set(1.72, 1.2, 0)
  cab.castShadow = true
  truck.add(cab)

  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.95, 2.0), matCab)
  hood.position.set(2.72, 0.78, 0)
  hood.castShadow = true
  truck.add(hood)

  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.82, 1.7), matGlass)
  glass.position.set(2.47, 1.45, 0)
  truck.add(glass)

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 2.05), matStripe)
  bumper.position.set(3.12, 0.42, 0)
  truck.add(bumper)

  for (const z of [0.72, -0.72]) {
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.34), matLight)
    headlight.position.set(3.08, 0.7, z)
    truck.add(headlight)
  }

  // ---- Wheels ----
  const wheels = []
  function makeWheel(x, z) {
    const g = new THREE.Group()
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.42, 26), matTire)
    tire.rotation.x = Math.PI / 2
    tire.castShadow = true
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.44, 16), matHub)
    hub.rotation.x = Math.PI / 2
    g.add(tire, hub)
    g.position.set(x, 0.56, z)
    return g
  }
  for (const [x, z] of [
    [1.72, 1.05],
    [1.72, -1.05],
    [-0.95, 1.05],
    [-0.95, -1.05],
  ]) {
    const w = makeWheel(x, z)
    wheels.push(w)
    truck.add(w)
  }

  scene.add(truck)

  // ---- Shadow-catching ground ----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.18 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.001
  ground.receiveShadow = true
  scene.add(ground)

  // ---- Moving road dashes (sense of motion) ----
  const dashes = []
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 })
  for (let i = 0; i < 7; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.16), dashMat)
    d.position.set(-6 + i * 2, 0.01, -1.9)
    scene.add(d)
    dashes.push(d)
  }

  // ---- Floating parcels ----
  const parcels = []
  const parcelMat = new THREE.MeshStandardMaterial({ color: 0xe8b877, roughness: 0.75 })
  for (let i = 0; i < 6; i++) {
    const s = 0.42 + Math.random() * 0.4
    const b = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), parcelMat.clone())
    b.material.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.15)
    b.position.set(-5 + Math.random() * 9, 2.4 + Math.random() * 3.2, -3.5 + Math.random() * 4.5)
    b.castShadow = true
    b.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    b.userData = { base: b.position.y, speed: 0.4 + Math.random() * 0.6, phase: Math.random() * Math.PI * 2 }
    scene.add(b)
    parcels.push(b)
  }

  // ---- Resize handling ----
  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  // ---- Pointer parallax ----
  let mx = 0
  let my = 0
  function onMove(e) {
    const r = canvas.getBoundingClientRect()
    mx = (e.clientX - r.left) / r.width - 0.5
    my = (e.clientY - r.top) / r.height - 0.5
  }
  window.addEventListener("pointermove", onMove)

  let raf
  let t = 0
  function tick() {
    t += 0.016
    truck.position.y = Math.sin(t * 1.6) * 0.05
    truck.rotation.y = -0.16 + Math.sin(t * 0.35) * 0.05
    wheels.forEach((w) => (w.rotation.z -= 0.14))
    dashes.forEach((d) => {
      d.position.x += 0.09
      if (d.position.x > 7) d.position.x = -7
    })
    parcels.forEach((b) => {
      b.position.y = b.userData.base + Math.sin(t * b.userData.speed + b.userData.phase) * 0.28
      b.rotation.x += 0.005
      b.rotation.y += 0.007
    })
    const tx = 7 + mx * 1.4
    const ty = 3.8 - my * 0.9
    camera.position.x += (tx - camera.position.x) * 0.05
    camera.position.y += (ty - camera.position.y) * 0.05
    camera.lookAt(0, 0.95, 0)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }

  if (prefersReduced) {
    resize()
    renderer.render(scene, camera)
  } else {
    tick()
  }

  return function cleanup() {
    cancelAnimationFrame(raf)
    ro.disconnect()
    window.removeEventListener("pointermove", onMove)
    renderer.dispose()
  }
}
