/**
 * @param {String[]} urls
 */
async function preloadImages(urls) {
	const output = await Promise.all(
		urls.map(
			(url) =>
				new Promise((resolve) => {
					const img = $(`<img src="${url}">`);
					img.on('load', function () {
						resolve(this);
					}).on('error', () => resolve(false));
					if (img.get(0).complete) img.trigger('load');
				})
		)
	);
	return output.filter((img) => !!img);
}

export { preloadImages };
