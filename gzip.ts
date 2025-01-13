const min = await Bun.file('dist/jx-query.min.js').text()
const compressed = Bun.gzipSync(min)
await Bun.write('dist/jx-query.min.js.gz', compressed)
