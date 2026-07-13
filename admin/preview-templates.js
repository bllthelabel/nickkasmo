CMS.registerPreviewStyle("/styles.css");

var PostPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var title = entry.getIn(["data", "title"]) || "";
    var pillar = entry.getIn(["data", "pillar"]) || "";
    var date = entry.getIn(["data", "date"]);
    var draft = entry.getIn(["data", "draft"]);

    return h(
      "div",
      { style: { padding: "40px", maxWidth: "720px" } },
      h("p", { className: "eyebrow" }, pillar),
      h("h1", {}, title),
      draft
        ? h(
            "p",
            { style: { color: "#b45309", fontWeight: "bold" } },
            "Concept — nog niet live"
          )
        : null,
      date ? h("p", {}, String(date)) : null,
      h("div", { className: "prose-block" }, this.props.widgetFor("body"))
    );
  },
});

var ItemPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var title = entry.getIn(["data", "title"]) || "";
    var icon = entry.getIn(["data", "icon"]) || "sparkles";
    var tags = entry.getIn(["data", "itemTags"]);
    var tagList = tags && tags.toJS ? tags.toJS() : [];

    return h(
      "div",
      { style: { padding: "40px", maxWidth: "480px" } },
      h(
        "article",
        { className: "item-card" },
        h(
          "div",
          { className: "item-card__media" },
          h("img", { src: "/assets/icons/" + icon + ".svg", alt: "" })
        ),
        h(
          "div",
          { className: "item-card__content" },
          h(
            "div",
            { className: "tag-list" },
            tagList.map(function (tag, i) {
              return h("span", { key: i }, String(tag).replace("-", " "));
            })
          ),
          h("h3", {}, title),
          h("div", {}, this.props.widgetFor("body"))
        )
      )
    );
  },
});

var PortfolioPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var title = entry.getIn(["data", "title"]) || "";
    var icon = entry.getIn(["data", "icon"]) || "sparkles";
    var meta = entry.getIn(["data", "meta"]) || "";
    var visualBadge = entry.getIn(["data", "visualBadge"]) || "";
    var chips = entry.getIn(["data", "chips"]);
    var chipList = chips && chips.toJS ? chips.toJS() : [];
    var featured = entry.getIn(["data", "featured"]);

    return h(
      "div",
      { style: { padding: "40px", maxWidth: "560px" } },
      h(
        "article",
        {
          className:
            "project-card" + (featured ? " project-card--featured" : ""),
        },
        h(
          "div",
          {
            className:
              "project-card__visual" +
              (featured ? " project-card__visual--site" : ""),
          },
          h("img", { src: "/assets/icons/" + icon + ".svg", alt: "" }),
          h("span", {}, visualBadge)
        ),
        h(
          "div",
          { className: "project-card__content" },
          h(
            "div",
            { className: "tag-list" },
            chipList.map(function (chip, i) {
              return h("span", { key: i }, chip);
            })
          ),
          h("p", { className: "project-card__meta" }, meta),
          h("h3", {}, title),
          h("div", {}, this.props.widgetFor("body"))
        )
      )
    );
  },
});

CMS.registerPreviewTemplate("posts", PostPreview);
CMS.registerPreviewTemplate("items", ItemPreview);
CMS.registerPreviewTemplate("portfolio", PortfolioPreview);
