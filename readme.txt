=== Latest Posts Showcase ===
Contributors: ataurwd
Tags: latest posts, post showcase, query loop, recent posts, blog grid, list layout
Requires at least: 6.0
Tested up to: 6.7
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Showcase your latest blog posts with beautiful customizable layouts, grid designs, and list views.

== Description ==

WordPress includes the Query Loop block, but many users find it too complex for a simple task: displaying recent posts anywhere on a page. The Latest Posts Showcase Block provides a fast, beginner-friendly way to display posts with attractive layouts and filtering options directly inside Gutenberg.

Simply insert the block, pick a style (Classic, Minimalist, or Magazine), select the categories you want to include or exclude, and display your posts in a responsive Grid or List system. Everything is customizable directly inside the sidebar editor using General and Style settings tabs!

== Installation ==

1. Upload the `latest-posts-showcase` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Open any page/post in the Gutenberg editor.
4. Search for "Latest Posts Showcase" and insert the block.

== Frequently Asked Questions ==

= Does this support Custom Post Types? =
This initial MVP version supports standard blog posts. Support for custom post types is planned for a future version.

= How do I exclude a category? =
Select the block, open the Settings sidebar under the "General" tab, and check the categories you wish to exclude under the "Exclude Categories" section.

= Is it SEO friendly? =
Yes! This block uses server-side rendering (dynamic block rendering), meaning the search engine crawlers can read the posts structure directly in the page HTML source without running client-side JavaScript.

== Changelog ==

= 1.0.0 =
* Initial release of the Latest Posts Showcase Block.
* Grid and List layouts.
* Classic, Minimalist, and Magazine overlay styles.
* Color and typography customizations.
* Sticky posts and category exclusion controls.
