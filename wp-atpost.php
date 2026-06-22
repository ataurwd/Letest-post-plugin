<?php
/**
 * Plugin Name:       WP atPost
 * Description:       Showcase your latest blog posts with beautiful customizable layouts and grid patterns.
 * Version:           1.0.0
 * Author:            Ataurwd
 * Author URI:        https://github.com/ataurwd
 * License:           GPL-2.0-or-later
 * Text Domain:       wp-atpost
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load plugin textdomain for translations.
 */
function atpx_load_textdomain() {
	load_plugin_textdomain( 'wp-atpost', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'atpx_load_textdomain' );

/**
 * Registers the Gutenberg block.
 */
function atpx_register_atpost_block() {
	register_block_type( __DIR__ . '/build', array(
		'render_callback' => 'atpx_render_atpost',
	) );
}
add_action( 'init', 'atpx_register_atpost_block' );

/**
 * Server-side rendering callback for the Gutenberg block.
 *
 * @param array $attributes Block attributes.
 * @param string $content Block content.
 * @return string Rendered block HTML.
 */
function atpx_render_atpost( $attributes, $content ) {
	// Extract attributes and assign defaults.
	$number_of_posts = isset( $attributes['numberOfPosts'] ) ? intval( $attributes['numberOfPosts'] ) : 6;
	$categories      = isset( $attributes['categories'] ) ? $attributes['categories'] : array();
	$order           = isset( $attributes['order'] ) ? sanitize_text_field( $attributes['order'] ) : 'desc';
	$offset          = isset( $attributes['offset'] ) ? intval( $attributes['offset'] ) : 0;

	$show_image     = isset( $attributes['showImage'] ) ? (bool) $attributes['showImage'] : true;
	$show_excerpt   = isset( $attributes['showExcerpt'] ) ? (bool) $attributes['showExcerpt'] : true;
	$show_date      = isset( $attributes['showDate'] ) ? (bool) $attributes['showDate'] : true;
	$show_author    = isset( $attributes['showAuthor'] ) ? (bool) $attributes['showAuthor'] : true;
	$show_read_more = isset( $attributes['showReadMore'] ) ? (bool) $attributes['showReadMore'] : true;

	$columns       = isset( $attributes['columns'] ) ? intval( $attributes['columns'] ) : 3;
	$card_style    = isset( $attributes['cardStyle'] ) ? sanitize_text_field( $attributes['cardStyle'] ) : 'style-1';
	$spacing       = isset( $attributes['spacing'] ) ? sanitize_text_field( $attributes['spacing'] ) : 'medium';
	$border_radius = isset( $attributes['borderRadius'] ) ? intval( $attributes['borderRadius'] ) : 8;
	$shadow        = isset( $attributes['shadow'] ) ? sanitize_text_field( $attributes['shadow'] ) : 'small';
	$aspect_ratio  = isset( $attributes['aspectRatio'] ) ? sanitize_text_field( $attributes['aspectRatio'] ) : '16-9';

	$layout_type       = isset( $attributes['layoutType'] ) ? sanitize_text_field( $attributes['layoutType'] ) : 'grid';
	$title_color       = isset( $attributes['titleColor'] ) ? sanitize_text_field( $attributes['titleColor'] ) : '';
	$title_font_size   = isset( $attributes['titleFontSize'] ) ? intval( $attributes['titleFontSize'] ) : 20;
	$meta_color        = isset( $attributes['metaColor'] ) ? sanitize_text_field( $attributes['metaColor'] ) : '';
	$badge_bg_color    = isset( $attributes['badgeBgColor'] ) ? sanitize_text_field( $attributes['badgeBgColor'] ) : '';
	$badge_text_color  = isset( $attributes['badgeTextColor'] ) ? sanitize_text_field( $attributes['badgeTextColor'] ) : '';
	$excerpt_font_size = isset( $attributes['excerptFontSize'] ) ? intval( $attributes['excerptFontSize'] ) : 14;
	$card_bg_color     = isset( $attributes['cardBgColor'] ) ? sanitize_text_field( $attributes['cardBgColor'] ) : '';

	$ignore_sticky_posts = isset( $attributes['ignoreStickyPosts'] ) ? (bool) $attributes['ignoreStickyPosts'] : true;
	$exclude_categories  = isset( $attributes['excludeCategories'] ) ? $attributes['excludeCategories'] : array();

	// Build WP Query arguments.
	$args = array(
		'posts_per_page'      => $number_of_posts,
		'post_status'         => 'publish',
		'ignore_sticky_posts' => $ignore_sticky_posts ? 1 : 0,
		'order'               => strtoupper( $order ),
		'orderby'             => 'date',
		'offset'              => $offset,
	);

	if ( ! empty( $categories ) ) {
		$args['category__in'] = $categories;
	}

	if ( ! empty( $exclude_categories ) ) {
		// Clean and sanitize array items.
		$args['category__not_in'] = array_map( 'intval', $exclude_categories );
	}

	$query = new WP_Query( $args );

	// Handle empty states.
	if ( ! $query->have_posts() ) {
		$empty_message = ! empty( $categories )
			? __( 'No articles available in this category.', 'wp-atpost' )
			: __( 'No posts found.', 'wp-atpost' );
		return '<div class="atpx-empty-state"><p>' . esc_html( $empty_message ) . '</p></div>';
	}

	// Dynamic classes and custom inline properties.
	$classes = array(
		'wp-block-atpx-wp-atpost',
		'atpx-layout-' . esc_attr( $layout_type ),
		'atpx-style-' . esc_attr( $card_style ),
		'atpx-spacing-' . esc_attr( $spacing ),
		'atpx-shadow-' . esc_attr( $shadow ),
		'atpx-ratio-' . esc_attr( $aspect_ratio ),
	);

	$inline_styles = "--atpx-columns: " . intval( $columns ) . "; --atpx-border-radius-val: " . intval( $border_radius ) . "px; --atpx-title-font-size: " . intval( $title_font_size ) . "px; --atpx-excerpt-font-size: " . intval( $excerpt_font_size ) . "px;";

	if ( ! empty( $title_color ) ) {
		$inline_styles .= " --atpx-title-color: " . esc_attr( $title_color ) . ";";
	}
	if ( ! empty( $meta_color ) ) {
		$inline_styles .= " --atpx-meta-color: " . esc_attr( $meta_color ) . ";";
	}
	if ( ! empty( $badge_bg_color ) ) {
		$inline_styles .= " --atpx-badge-bg-color: " . esc_attr( $badge_bg_color ) . ";";
	}
	if ( ! empty( $badge_text_color ) ) {
		$inline_styles .= " --atpx-badge-text-color: " . esc_attr( $badge_text_color ) . ";";
	}
	if ( ! empty( $card_bg_color ) ) {
		$inline_styles .= " --atpx-card-bg-color: " . esc_attr( $card_bg_color ) . ";";
	}

	$wrapper_attributes = get_block_wrapper_attributes( array(
		'class' => implode( ' ', $classes ),
		'style' => trim( $inline_styles ),
	) );

	ob_start();
	?>
	<div <?php echo $wrapper_attributes; ?>>
		<?php
		while ( $query->have_posts() ) {
			$query->the_post();
			$post_id = get_the_ID();
			?>
			<a href="<?php echo esc_url( get_permalink() ); ?>" class="atpx-post-card">
				<?php if ( $show_image && 'style-2' !== $card_style ) : ?>
					<div class="atpx-post-image-wrapper">
						<?php
						$post_categories = get_the_category( $post_id );
						if ( ! empty( $post_categories ) ) {
							echo '<span class="atpx-post-category-tag">' . esc_html( $post_categories[0]->name ) . '</span>';
						}

						if ( has_post_thumbnail() ) {
							the_post_thumbnail( 'medium_large' );
						} else {
							echo '<div style="width:100%; height:100%; background:linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);"></div>';
						}
						?>
					</div>
				<?php endif; ?>

				<div class="atpx-post-content">
					<?php if ( $show_date || $show_author ) : ?>
						<div class="atpx-post-meta">
							<?php if ( $show_date ) : ?>
								<span class="atpx-post-date"><?php echo esc_html( get_the_date() ); ?></span>
							<?php endif; ?>
							<?php if ( $show_date && $show_author ) : ?>
								<span class="atpx-meta-sep">•</span>
							<?php endif; ?>
							<?php if ( $show_author ) : ?>
								<span class="atpx-post-author"><?php echo esc_html( sprintf( esc_html__( 'By %s', 'wp-atpost' ), esc_html( get_the_author() ) ) ); ?></span>
							<?php endif; ?>
						</div>
					<?php endif; ?>

					<h3 class="atpx-post-title">
						<?php echo esc_html( get_the_title() ); ?>
					</h3>

					<?php if ( $show_excerpt && 'style-1' === $card_style ) : ?>
						<div class="atpx-post-excerpt">
							<?php echo wp_kses_post( get_the_excerpt() ); ?>
						</div>
					<?php endif; ?>

					<?php if ( $show_read_more && 'style-1' === $card_style ) : ?>
						<span class="atpx-post-readmore">
							<?php esc_html_e( 'Read More', 'wp-atpost' ); ?>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
								<line x1="5" y1="12" x2="19" y2="12"></line>
								<polyline points="12 5 19 12 12 19"></polyline>
							</svg>
						</span>
					<?php endif; ?>
				</div>
			</a>
			<?php
		}
		wp_reset_postdata();
		?>
	</div>
	<?php
	return ob_get_clean();
}
