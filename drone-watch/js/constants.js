// ── Main Script (cont.) ─────────────────────────────────────────────────────
export const WORLD_UP = [0, 1, 0];
// ── Main Script ─────────────────────────────────────────────────────────────
export const CAMERA_MOVE_SPEED = 18;
export const CAMERA_ROTATE_SPEED = Math.PI;
export const MOBILE_CAMERA_IDX = 5;
export const AMPLITUDE_PITCH = [-60, 60];
export const AMPLITUDE_X = [-50, 50];
export const AMPLITUDE_Y = [-50, 50];
export const AMPLITUDE_Z = [-50, 50];

// ── Scene ────────────────────────────────────────────────────────────────────
export const BG_COLOR = 0x222222;

// ── Lights ───────────────────────────────────────────────────────────────────
export const LIGHT_COLOR = 0xffffff;
export const AMBIENT_INTENSITY = 0.5;
export const SUN_INTENSITY = 1.0;
export const SUN_POS = [10, 20, 10];

// ── Cameras ──────────────────────────────────────────────────────────────────
export const FRUSTUM_SIZE = 80; // ortho camera half-height (world units)
export const CAM_NEAR = 0.1;
export const CAM_FAR = 1000;
export const CAM_ORTHO_DIST = 150; // how far axis-aligned cameras sit from origin
export const CAM_FIXED_POS = [80, 80, 80]; // shared position for cams 4 & 5
export const CAM_PERSP_FOV = 60; // fixed perspective camera FOV (degrees)
export const CAM_MOBILE_FOV = 75; // onboard (watch) camera FOV
export const CAM_MOBILE_POS = [0, 2.2, -0.5];
export const CAM_MOBILE_TARGET = [0, 2.0, 10];
export const DEFAULT_CAM_IDX = 4; // 0-indexed; camera 5 on startup

// ── Balloon geometry ─────────────────────────────────────────────────────────
export const BALLOON_COLOR = 0xff3333;
export const RIBBON_COLOR = 0xdddddd;
const multiplier = 3;
export const BALLOON_RADIUS = 1 * multiplier;
export const KNOT_RADIUS = 0.16 * multiplier;
export const KNOT_HEIGHT = 0.36 * multiplier;
export const RIBBON_RADIUS = 0.05 * multiplier;
export const RIBBON_HEIGHT = 2.8 * multiplier;
export const BALLOON_SEG_W = 16; // sphere width segments
export const BALLOON_SEG_H = 12; // sphere height segments
export const KNOT_SEGMENTS = 8; // cone radial segments
export const RIBBON_SEGMENTS = 8; // cylinder radial segments

// ── Balloon spawn ────────────────────────────────────────────────────────────
export const BALLOON_COUNT = 4;
export const BALLOON_SPREAD_XZ = 80; // full spawn width on X and Z axes
export const BALLOON_Y_MIN = 15; // minimum spawn height (above the watch)
export const BALLOON_Y_SPREAD = 30; // random height range above Y_MIN

// ── Animation ────────────────────────────────────────────────────────────────
export const MAX_DT = 0.1; // clamp to avoid spiral of death on tab switch

// ── DroneWatch movement ───────────────────────────────────────────────────────
export const DRONE_MOVE_SPEED = 5; // world units per second
export const DRONE_ROT_SPEED = Math.PI / 2; // radians per second

// ── Watch body ───────────────────────────────────────────────────────────────
export const WATCH_BODY_SIZE = 5.0;
export const WATCH_BODY_HEIGHT = 0.9;
export const WATCH_BODY_COLOR = 0x444444;
export const WATCH_FACE_SIZE = 4.4;
export const WATCH_FACE_HEIGHT = 0.15;
export const WATCH_FACE_COLOR = 0xdddddd;
export const WATCH_BUTTON_RADIUS = 0.3;
export const WATCH_BUTTON_HEIGHT = 1.25;
export const WATCH_BUTTON_SEGS = 16;
export const WATCH_BUTTON_COLOR = 0x888888;
export const WATCH_BUTTON_POS_Y =
  WATCH_BODY_HEIGHT / 2 + WATCH_BUTTON_RADIUS - 0.1;
export const WATCH_BUTTON_POS_Z = WATCH_BODY_SIZE / 2;
export const WATCH_BUTTON_ROT_Z = Math.PI / 2;

// ── Arm ──────────────────────────────────────────────────────────────────────
export const ARM_LENGTH = 2.2;
export const ARM_HALF_LENGTH = ARM_LENGTH / 2;
export const ARM_HEIGHT = 0.34;
export const ARM_WIDTH = 0.425;
export const ARM_COLOR = 0x555555;
export const ARM_EXTENDED_X = 3 * Math.SQRT2 - 1; // arm root at watch body corner (6×6 body, 45° arms) plus the -1 to still be inside
export const ARM_RETRACTED_X = -ARM_LENGTH; // fully retracted: hidden inside watch
export const ARM_ANIM_SPEED = 3;

// ── GUI ranges ───────────────────────────────────────────────────────────────
export const GUI_MOVE_SPEED_MIN = 1;
export const GUI_MOVE_SPEED_MAX = 30;
export const GUI_MOVE_SPEED_STEP = 0.5;
export const GUI_ROT_SPEED_MIN = 0.1;
export const GUI_ROT_SPEED_MAX = Math.PI * 2;
export const GUI_ROT_SPEED_STEP = 0.05;

// ── GUI Params Defaults ─────────────────────────────────────────────────────
export const GUI_PARAMS_DEFAULTS = {
  camera: DEFAULT_CAM_IDX,
  helpers: false,
  wireframe: false,
  moveSpeed: DRONE_MOVE_SPEED,
  rotSpeed: DRONE_ROT_SPEED,
};

// ── Strap ────────────────────────────────────────────────────────────────────
export const STRAP_LENGTH = 9;
export const STRAP_WIDTH = 2;
export const STRAP_HEIGHT = 0.3;
export const STRAP_BEND = 1; // main bend amplitude
export const STRAP_TIP = 4.0; // extra curl at tips
export const STRAP_COLOR = 0x444444;

// Strap y-offset from droneCenter (body center): flush below body bottom
export const STRAP_POS_Y = -(WATCH_BODY_HEIGHT / 2 + STRAP_HEIGHT / 2) + 0.15;

// ── Collision & animation ────────────────────────────────────────────────────
export const POP_DURATION = 0.5; // seconds for balloon pop animation

// ── Rotor ────────────────────────────────────────────────────────────────────
export const ROTOR_COLOR = 0xffff00; // caixilharia
export const HUB_COLOR = 0x888888; // hub motor
export const BLADE_COLOR = 0x666666; // hélice
export const ROTOR_RADIUS = 1.5;
export const ROTOR_TUBE = 0.3;
export const HUB_RADIUS = 0.06;
export const HUB_TUBE = 0.1;
export const BLADE_LENGTH = ROTOR_RADIUS;
export const BLADE_HEIGHT = 0.05;
export const BLADE_WIDTH = ROTOR_RADIUS * 0.28;
