import * as THREE from 'https://threejs.org/build/three.module.js';

const fragShader = `
precision mediump float;
varying vec2 vUv;

uniform float uTime;
uniform sampler2D uTexture;
uniform float uNoiseSpeed;
uniform float uNoiseFreq;
uniform float uNoiseAmp;

vec2 incidentVec;
vec2 normalVec;
float strength;

////////////////////////////////////////////////////////////
/// FRACTIONAL BROWNIAN NOISE BY YIWENL ON GITHUB:
/// https://github.com/yiwenl/glsl-fbm/blob/master/2d.glsl
 
#define NUM_OCTAVES 5

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    
    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}
////////////////////////////////////////////////////////////

void main() {
  vec2 uv = vUv;

  vec2 indicentVec = vec2(0, 0);

  float strength = smoothstep(1.5, 0.0, uv.y);
  vec2 normalVec = strength * vec2(
    mix(-0.3, 0.3, fbm(uNoiseFreq * uv + uTime * uNoiseSpeed)) * uNoiseAmp, 
    mix(-0.3, 0.3, fbm(uNoiseFreq * uv + uTime * uNoiseSpeed)) * uNoiseAmp
  );

  uv += refract(
    incidentVec, 
    normalVec, 
    1.0 / 1.333
  );

  gl_FragColor = texture2D(uTexture, uv);
}`;

const vertShader = `
precision mediump float;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  gl_Position = vec4(pos, 1.0);
}`;

function createShaderMaterial(
	textureImage,
	noiseAmplitude = 0.1,
	noiseFrequency = 3,
	noiseSpeed = 0.1
) {
	return new THREE.ShaderMaterial({
		vertexShader: vertShader,
		fragmentShader: fragShader,
		transparent: true,
		side: THREE.DoubleSide,
		uniforms: {
			uTime: { value: 0.0 },
			uTexture: {
				value: new THREE.TextureLoader().load(textureImage),
			},
			uNoiseAmp: {
				value: noiseAmplitude,
			},
			uNoiseFreq: {
				value: noiseFrequency,
			},
			uNoiseSpeed: {
				value: noiseSpeed,
			},
		},
	});
}

export { fragShader, vertShader, createShaderMaterial };

// const fragShader = `
// precision mediump float;

// varying vec2 vUv;
// uniform sampler2D uTexture;

// void main() {
//     gl_FragColor = texture2D(uTexture, vUv);
// }`;

// const vertShader = `
// precision mediump float;

// varying vec2 vUv;
// uniform float uTime;
// uniform float uNoiseFreq;
// uniform float uNoiseAmp;
// uniform float uNoiseSpeed;

// //
// // Description : Array and textureless GLSL 2D/3D/4D simplex
// //               noise functions.
// //      Author : Ian McEwan, Ashima Arts.
// //  Maintainer : ijm
// //     Lastmod : 20110822 (ijm)
// //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
// //               Distributed under the MIT License. See LICENSE file.
// //               https://github.com/ashima/webgl-noise
// //

// vec3 mod289(vec3 x) {
//   return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec4 mod289(vec4 x) {
//   return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec4 permute(vec4 x) {
//      return mod289(((x*34.0)+1.0)*x);
// }

// vec4 taylorInvSqrt(vec4 r)
// {
//   return 1.79284291400159 - 0.85373472095314 * r;
// }

// float snoise(vec3 v) {
//   const vec2  C = vec2(
//     1.0/6.0,
//     1.0/3.0
//     );
//   const vec4  D = vec4(
//     0.0,
//     0.5,
//     1.0,
//     2.0
//     );

//   // First corner
//   vec3 i  = floor(v + dot(v, C.yyy) );
//   vec3 x0 =   v - i + dot(i, C.xxx) ;

//   // Other corners
//   vec3 g = step(x0.yzx, x0.xyz);
//   vec3 l = 1.0 - g;
//   vec3 i1 = min( g.xyz, l.zxy );
//   vec3 i2 = max( g.xyz, l.zxy );

//   //   x0 = x0 - 0.0 + 0.0 * C.xxx;
//   //   x1 = x0 - i1  + 1.0 * C.xxx;
//   //   x2 = x0 - i2  + 2.0 * C.xxx;
//   //   x3 = x0 - 1.0 + 3.0 * C.xxx;
//   vec3 x1 = x0 - i1 + C.xxx;
//   vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
//   vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

//   // Permutations
//   i = mod289(i);
//   vec4 p = permute( permute( permute(
//              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
//            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
//            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

//   // Gradients: 7x7 points over a square, mapped onto an octahedron.
//   // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
//   float n_ = 0.142857142857; // 1.0/7.0
//   vec3  ns = n_ * D.wyz - D.xzx;

//   vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

//   vec4 x_ = floor(j * ns.z);
//   vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

//   vec4 x = x_ *ns.x + ns.yyyy;
//   vec4 y = y_ *ns.x + ns.yyyy;
//   vec4 h = 1.0 - abs(x) - abs(y);

//   vec4 b0 = vec4( x.xy, y.xy );
//   vec4 b1 = vec4( x.zw, y.zw );

//   //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
//   //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
//   vec4 s0 = floor(b0)*2.0 + 1.0;
//   vec4 s1 = floor(b1)*2.0 + 1.0;
//   vec4 sh = -step(h, vec4(0.0));

//   vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
//   vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

//   vec3 p0 = vec3(a0.xy,h.x);
//   vec3 p1 = vec3(a0.zw,h.y);
//   vec3 p2 = vec3(a1.xy,h.z);
//   vec3 p3 = vec3(a1.zw,h.w);

//   // Normalise gradients
//   vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
//   p0 *= norm.x;
//   p1 *= norm.y;
//   p2 *= norm.z;
//   p3 *= norm.w;

//   // Mix final noise value
//   vec4 m = max(
//     0.6 - vec4(
//       dot(x0,x0),
//       dot(x1,x1),
//       dot(x2,x2),
//       dot(x3,x3)
//     ), 0.0);

//   m = m * m;
//   return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
//                                 dot(p2,x2), dot(p3,x3) ) );
// }

// void main() {
//   vUv = uv;

//   vec3 pos = position;
//   vec3 noisePos = vec3(
//     pos.x * uNoiseFreq + uTime * uNoiseSpeed,
//     pos.y * uNoiseFreq + uTime * uNoiseSpeed,
//     pos.z * uNoiseFreq + uTime * uNoiseSpeed
//     );
//   pos.z += snoise(noisePos) * uNoiseAmp;

//   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
// }`;
