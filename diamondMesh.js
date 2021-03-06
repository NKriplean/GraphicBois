var diamondMesh = {
  "version" : "0.1.0",

  "comment" : "Generated by MeshLab JSON Exporter",

  "id"      : 1,
  "name"    : "mesh",

  "vertices" :
  [
    {
      "name"       : "position_buffer",
      "size"       : 3,
      "type"       : "float32",
      "normalized" : false,
      "values"     :
      [
        -0.999834, 0.0182078, -0.000534685, -0.000522596, -0.0052049, 0.799983, -0.694117, 0.71985, 0.0042301, -0.719861, -0.6941, -0.00498625, -0.018204, -0.999813, -0.00651694, 0.694117, -0.719849, -0.00423009, 0.999834, -0.0182079, 0.000534685, 0.719862, 0.6941, 0.00498625, 0.0182038, 0.999813, 0.00651694, -0.599672, 0.0132018, -0.350313,
        -0.416242, 0.434187, -0.347454, -0.431688, -0.414183, -0.352984, -0.0106938, -0.597611, -0.353903, 0.416699, -0.429632, -0.352531, 0.600129, -0.00864759, -0.349672, 0.432146, 0.418737, -0.347001, 0.011151, 0.602165, -0.346082, 0.000228636, 0.00227714, -0.349993
      ]
    },

    {
      "name"       : "normal_buffer",
      "size"       : 3,
      "type"       : "float32",
      "normalized" : false,
      "values"     :
      [
        -0.761173, 0.325139, 0.959706, -0.364524, 0.155708, 0.459601, -0.761173, 0.325139, 0.959706, -0.772732, -0.309694, 0.955568, -0.332001, -0.766764, 0.952883, 0.302845, -0.778325, 0.953222, 0.759922, -0.337605, 0.956388, 0.771481, 0.297228, 0.960526, 0.33075, 0.754297, 0.963212, -0.73664, 0.326721, -0.847425,
        -1.17351, 0.520485, -1.35, -0.443514, -0.171168, -0.50495, -0.190161, -0.433913, -0.506494, 0.174778, -0.440558, -0.506299, 0.437528, -0.187212, -0.504479, 0.444172, 0.17772, -0.5021, 0.190819, 0.440465, -0.500556, 0.000513072, 0.00510991, -0.785382
      ]
    }
  ],

  "connectivity" :
  [
    {
      "name"      : "triangles",
      "mode"      : "triangles_list",
      "indexed"   : true,
      "indexType" : "uint32",
      "indices"   :
      [
        0, 1, 2, 1, 0, 3, 1, 3, 4, 1, 4, 5, 1, 5, 6, 1, 6, 7, 1, 7, 8, 1, 8, 2, 9, 0, 2, 2, 10, 9,
        0, 9, 11, 11, 3, 0, 3, 11, 12, 12, 4, 3, 4, 12, 13, 13, 5, 4, 5, 13, 14, 14, 6, 5, 6, 14, 15, 15, 7, 6,
        7, 15, 16, 16, 8, 7, 8, 16, 10, 10, 2, 8, 17, 9, 10, 9, 17, 11, 11, 17, 12, 12, 17, 13, 13, 17, 14, 14, 17, 15,
        15, 17, 16, 16, 17, 10
      ]
    }
  ],

  "mapping" :
  [
    {
      "name"       : "standard",
      "primitives" : "triangles",
      "attributes" :
      [
        {
          "source"   : "position_buffer",
          "semantic" : "position",
          "set"      : 0
        },
        {
          "source"   : "normal_buffer",
          "semantic" : "normal",
          "set"      : 0
        }
      ]
    }
  ],

  "custom" : null
}
