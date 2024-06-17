#ifdef GL_ES

precision highp float;

#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_span;

uniform sampler2D u_tex;

varying vec2 vTexCoord;

void main() {
    float span = u_span;
    vec2 uv = vTexCoord;
    vec2 st = vTexCoord.xy / u_resolution.xy;
    vec2 position = gl_FragCoord.xy/u_resolution.xy;
    //vec2 discrete_st = float(int(st*vec2(10.))) / vec2(10.);
    
    vec2 discrete_st = 
        vec2(
            float(int(st.x*span)) / span,
            float(int(st.y*span)) / span
        );
    
    vec3 color = texture2D(u_tex, discrete_st).rgb;

    /*vec3 color = vec3(1.0, 1.0, 1.0);
    float d = distance(discrete_st, u_mouse);
    if(d < 0.3){
        color = vec3(1.0, 0.0, 0.0);
    }*/

    
    gl_FragColor = vec4(color, 1.);

    // if(gl_FragColor.r > 0.99 && gl_FragColor.g > 0.99 && gl_FragColor.b > 0.99){
    //     gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    // }
    if(gl_FragColor.r ==1. && gl_FragColor.g ==1. && gl_FragColor.b ==1. && gl_FragColor.b == 1.){
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }else{
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    
    // gl_FragColor = vec4(color, 1.0);
}