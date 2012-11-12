/*global module:false */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/*.js']
    },
    mdlldr: {
      lil_: {
        root: './node_modules/lil_/lib',
        src: ['lil_.js'],
        dest: './build/lil_.js'
      },
      lilobj: {
        root: './node_modules/lilobj/lib',
        src: ['lilobj.js'],
        dest: './build/lilobj.js',
        overrides : { lil_: 'lil_' }
      },
      vladiator: {
        root: './node_modules/vladiator/lib',
        src: ['vladiator.js'],
        dest: './build/vladiator.js',
        overrides : { lil_: 'lil_' }
      },
      lilmodel: {
        root: './lib',
        src: ['lilmodel.js'],
        dest: './build/lilmodel.js',
        overrides: {
          lil_: 'lil_',
          lilobj: 'lilobj',
          vladiator: 'vladiator'
        }
      }
    },
    buster: {
      test: {
        config: 'test/buster.js'
      },
      server: {
        port: 1111
      }
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          '<file_strip_banner:node_modules/lilprovider/lib/lilprovider.js>',
          '<file_strip_banner:build/lil_.js>',
          '<file_strip_banner:build/lilobj.js>',
          '<file_strip_banner:build/vladiator.js>',
          '<file_strip_banner:build/<%= pkg.name %>.js>'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint buster'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        strict: false,
        eqnull: true,
        browser: true,
        node: true
      },
      globals: {}
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint mdlldr concat min buster');
  grunt.loadNpmTasks('grunt-mdlldr');
  grunt.loadNpmTasks('grunt-buster');

};
