// Camera
export const CAMERA_FOV = 60;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 100;
export const CAMERA_Z = 2;

// Model display — fit size and position inside box
export const MODEL_FIT_SIZE = 0.5;
export const ARTEMIS_FIT_SIZE = 0.8;
export const MODEL_POSITION_X = 0;
export const MODEL_POSITION_Y = 0;
export const MODEL_POSITION_Z = 0;

// Model indices
export const ARTEMIS_IDX = 0;
export const CAT_IDX = 1;
export const TESSERACT_IDX = 2;

// Animation — cat
export const CAT_ROT_SPEED = 0.01; // rad/frame, Y axis

// Animation — default (Artemis)
export const DEFAULT_ROT_X = 0.004; // rad/frame
export const DEFAULT_ROT_Y = 0.008; // rad/frame

// Materials
export const MODEL_COLOR = 0x888888; // grey — leaves room for specular to pop
export const PHONG_SHININESS = 200;
export const PHONG_SPECULAR = 0x00aaff; // blue tint — visible against white diffuse

// Tesseract geometry — parametric 4D→3D perspective projection
// Outer half-size = SIZE × VIEW_DIST/(VIEW_DIST-1), inner = SIZE × VIEW_DIST/(VIEW_DIST+1)
export const TESSERACT_SIZE = 0.3; // overall scale applied after projection
export const TESSERACT_VIEW_DIST = 2.0; // 4D viewer distance (w-axis)

// Tesseract materials
export const TESSERACT_FACE_COLOR = 0x00ccff;
export const TESSERACT_CONN_COLOR = 0x0088bb;
export const TESSERACT_FACE_OPACITY = 0.45;
export const TESSERACT_CONN_OPACITY = 0.25;
export const TESSERACT_SHININESS = 180;
export const TESSERACT_SPECULAR = 0xffffff; // bright white — makes Phong highlights pop vs Lambert

// Tesseract normal map
export const NORMALMAP_SIZE = 512;
export const NORMALMAP_RINGS = 7;

// Tesseract animation
export const TESSERACT_ROT_X = 0.004; // rad/frame
export const TESSERACT_ROT_Y = 0.008; // rad/frame
export const TESSERACT_SCALE_MIN = 0.5;
export const TESSERACT_SCALE_MAX = 0.9;
export const TESSERACT_SCALE_FREQ = 0.5; // Hz

// Lights — global
export const AMBIENT_INTENSITY = 0.15;
export const DIR_INTENSITY = 0.7; // reduced so per-model lights are visible
export const DIR_POS_X = 5;
export const DIR_POS_Y = 8;
export const DIR_POS_Z = 5;

// Lights — per-model point lights (opposite sides, strong colors)
export const POINT1_COLOR = 0xff5500; // deep orange — left
export const POINT2_COLOR = 0x00ccff; // cyan blue   — right
export const POINT_INTENSITY = 6;
export const POINT_RANGE = 4; // short range = sharp falloff

// Lights — per-model spotlights (tight beams, distinct colors)
export const SPOT1_COLOR = 0xffffff; // white — top left
export const SPOT2_COLOR = 0xff0088; // magenta — top right
export const SPOT_INTENSITY = 10;
export const SPOT_ANGLE = Math.PI / 18; // ~10° very tight beam
export const SPOT_PENUMBRA = 0.08; // sharp edge
