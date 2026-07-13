module.exports = {
  tags: ["posts"],
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `blog/${data.pillar}/${data.page.fileSlug}/index.html`),
    canonical: (data) => `/blog/${data.pillar}/${data.page.fileSlug}/`,
    metaDescription: (data) => data.excerpt,
    ogTitle: (data) => `${data.title} - NickKasmo.nl`,
  },
};
