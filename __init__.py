from .nodes.random_character_picker import RandomCharacterPicker

NODE_CLASS_MAPPINGS = {
    "RandomCharacterPicker": RandomCharacterPicker,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "RandomCharacterPicker": "Random Character Picker",
}

WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
