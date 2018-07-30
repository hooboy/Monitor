module.exports = ({ file, options, env }) => ({
    parser: false,
    plugins: {
        'postcss-import': {
            root: file.dirname
        },
        'postcss-cssnext': options.cssnext ? options.cssnext : false,
        'autoprefixer': env == 'production' ? options.autoprefixer : false,
        'cssnano': env === 'production' ? options.cssnano : false
    }
})
