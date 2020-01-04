import BitmapSkin from "./BitmapSkin.mjs";
import SpeechBubbleSkin from "./SpeechBubbleSkin.mjs";
import VectorSkin from "./VectorSkin.mjs";

// This is a class which manages the creation and destruction of Skin objects.
// A Skin is the renderer's version of a "costume". It is backed by an image, but you render it by getting its texture.
// Different types of Skins can give you textures in different ways.
export default class SkinCache {
  constructor(renderer) {
    this._renderer = renderer;
    this.gl = renderer.gl;

    this._skins = new Map();
  }

  // Begin GC tracing. Any skin retrieved and rendered during tracing will *not* be garbage-collected.
  beginTrace() {
    // Initialize by assuming no texture is used.
    this._skins.forEach(skin => {
      skin.used = false;
    });
  }

  // End GC tracing. Any skin not retrieved since the tracing begun will be deleted.
  endTrace() {
    this._skins.forEach((skin, key) => {
      if (!skin.used) {
        skin.destroy();
        this._skins.delete(key);
      }
    });
  }

  // Retrieve a given object (e.g. costume or speech bubble)'s skin. If it doesn't exist, make one.
  getSkin(obj) {
    if (this._skins.has(obj)) {
      const skin = this._skins.get(obj);
      skin.used = true;
      return skin;
    } else {
      let skin;

      // TODO: this is a janky way to tell whether this is a speech bubble
      if (obj.text) {
        skin = new SpeechBubbleSkin(this._renderer, obj);
      }
      // If it's not a speech bubble, it's a costume.
      // TODO: there's gotta be a better way to tell if an image is an SVG
      else if (obj.img.src.endsWith(".svg")) {
        skin = new VectorSkin(this._renderer, obj.img);
      } else {
        skin = new BitmapSkin(this._renderer, obj.img);
      }
      this._skins.set(obj, skin);
      return skin;
    }
  }
}