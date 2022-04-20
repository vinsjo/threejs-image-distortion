const fragShader = `
precision mediump float;
varying vec2 vUv;

uniform float uTime;
uniform sampler2D uTexture;
uniform float uNoiseSpeed;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uNoiseLimit;

vec2 incidentVec;
vec2 normalVec;

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

  vec2 normalVec = vec2(
    mix(-uNoiseLimit, uNoiseLimit, fbm(
		uNoiseFreq * uv + uTime * uNoiseSpeed)) * uNoiseAmp, 
    mix(-uNoiseLimit, uNoiseLimit, fbm(
		uNoiseFreq * uv + uTime * uNoiseSpeed)) * uNoiseAmp
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
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

export { fragShader, vertShader };
