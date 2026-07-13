module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy(".nojekyll");

  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("whereGroup", (arr, slug) =>
    (arr || []).filter((item) => item.data.group === slug)
  );
  eleventyConfig.addFilter("wherePillar", (arr, slug) =>
    (arr || []).filter((item) => item.data.pillar === slug)
  );
  eleventyConfig.addFilter("findPillar", (pillars, slug) =>
    (pillars || []).find((p) => p.slug === slug)
  );
  eleventyConfig.addFilter("sortByOrder", (arr) =>
    [...(arr || [])].sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
  );
  eleventyConfig.addFilter("dutchDate", (date) =>
    new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(date)
  );
  eleventyConfig.addFilter("isoDate", (date) => date.toISOString().slice(0, 10));

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByTag("posts")
      .filter((post) => !post.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
