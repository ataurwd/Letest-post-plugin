import { useSelect } from '@wordpress/data';
import { useBlockProps, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
	Spinner,
	TabPanel
} from '@wordpress/components';
import { RawHTML, useState } from '@wordpress/element';

function ReorderableItems( { items, onChange } ) {
	const handleMoveUp = ( index ) => {
		if ( index === 0 ) return;
		const newItems = [ ...items ];
		const temp = newItems[ index ];
		newItems[ index ] = newItems[ index - 1 ];
		newItems[ index - 1 ] = temp;
		onChange( newItems );
	};

	const handleMoveDown = ( index ) => {
		if ( index === items.length - 1 ) return;
		const newItems = [ ...items ];
		const temp = newItems[ index ];
		newItems[ index ] = newItems[ index + 1 ];
		newItems[ index + 1 ] = temp;
		onChange( newItems );
	};

	const [ dragIndex, setDragIndex ] = useState( null );

	const onDragStart = ( e, index ) => {
		setDragIndex( index );
		e.dataTransfer.effectAllowed = 'move';
	};

	const onDragOver = ( e, index ) => {
		e.preventDefault();
	};

	const onDrop = ( e, index ) => {
		if ( dragIndex === null || dragIndex === index ) return;
		const newItems = [ ...items ];
		const draggedItem = newItems[ dragIndex ];
		newItems.splice( dragIndex, 1 );
		newItems.splice( index, 0, draggedItem );
		onChange( newItems );
		setDragIndex( null );
	};

	const itemLabels = {
		image: 'Featured Image',
		meta: 'Meta Info (Date/Author)',
		title: 'Post Title',
		excerpt: 'Post Excerpt',
		readMore: 'Read More Link'
	};

	return (
		<div className="atpx-reorderable-list">
			{ items.map( ( item, index ) => (
				<div
					key={ item }
					className={`atpx-reorderable-item ${ dragIndex === index ? 'is-dragging' : '' }`}
					draggable
					onDragStart={ ( e ) => onDragStart( e, index ) }
					onDragOver={ ( e ) => onDragOver( e, index ) }
					onDrop={ ( e ) => onDrop( e, index ) }
					style={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '8px 12px',
						marginBottom: '6px',
						background: '#f8fafc',
						border: '1px solid #e2e8f0',
						borderRadius: '6px',
						cursor: 'grab'
					} }
				>
					<div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<circle cx="9" cy="5" r="1" />
							<circle cx="9" cy="12" r="1" />
							<circle cx="9" cy="19" r="1" />
							<circle cx="15" cy="5" r="1" />
							<circle cx="15" cy="12" r="1" />
							<circle cx="15" cy="19" r="1" />
						</svg>
						<span style={ { fontSize: '13px', fontWeight: '500', color: '#334155' } }>
							{ itemLabels[ item ] }
						</span>
					</div>
					<div style={ { display: 'flex', gap: '4px' } }>
						<button
							onClick={ ( e ) => { e.preventDefault(); handleMoveUp( index ); } }
							disabled={ index === 0 }
							style={ {
								background: 'none',
								border: 'none',
								cursor: index === 0 ? 'not-allowed' : 'pointer',
								opacity: index === 0 ? 0.3 : 1,
								padding: '2px'
							} }
							title="Move Up"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="18 15 12 9 6 15" />
							</svg>
						</button>
						<button
							onClick={ ( e ) => { e.preventDefault(); handleMoveDown( index ); } }
							disabled={ index === items.length - 1 }
							style={ {
								background: 'none',
								border: 'none',
								cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
								opacity: index === items.length - 1 ? 0.3 : 1,
								padding: '2px'
							} }
							title="Move Down"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</button>
					</div>
				</div>
			) ) }
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		contentOrder,
		numberOfPosts,
		categories,
		order,
		offset,
		showImage,
		showExcerpt,
		showDate,
		showAuthor,
		showReadMore,
		columns,
		cardStyle,
		spacing,
		borderRadius,
		shadow,
		aspectRatio,
		layoutType,
		titleColor,
		titleFontSize,
		metaColor,
		badgeBgColor,
		badgeTextColor,
		excerptFontSize,
		cardBgColor,
		ignoreStickyPosts,
		excludeCategories
	} = attributes;

	// Fetch categories for the sidebar checklist filter
	const categoriesList = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'category', { per_page: -1 } ) || [];
	}, [] );

	// Fetch posts based on block attributes
	const queryArgs = {
		per_page: numberOfPosts,
		order: order,
		offset: offset,
		_embed: true,
	};
	if ( categories && categories.length > 0 ) {
		queryArgs.categories = categories;
	}
	if ( excludeCategories && excludeCategories.length > 0 ) {
		queryArgs.categories_exclude = excludeCategories;
	}

	const posts = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'postType', 'post', queryArgs );
	}, [ numberOfPosts, categories, excludeCategories, order, offset ] );

	// Handle category checklist checkbox changes
	const handleCategoryChange = ( categoryId ) => {
		let newCategories;
		if ( categories.includes( categoryId ) ) {
			newCategories = categories.filter( ( id ) => id !== categoryId );
		} else {
			newCategories = [ ...categories, categoryId ];
		}
		setAttributes( { categories: newCategories } );
	};

	// Handle exclude category changes
	const handleExcludeCategoryChange = ( categoryId ) => {
		let newExclusions;
		if ( excludeCategories.includes( categoryId ) ) {
			newExclusions = excludeCategories.filter( ( id ) => id !== categoryId );
		} else {
			newExclusions = [ ...excludeCategories, categoryId ];
		}
		setAttributes( { excludeCategories: newExclusions } );
	};

	// Determine custom CSS custom variables inline styles
	const inlineStyles = {
		'--atpx-columns': columns,
		'--atpx-border-radius-val': `${ borderRadius }px`,
		'--atpx-title-color': titleColor || undefined,
		'--atpx-title-font-size': `${ titleFontSize }px`,
		'--atpx-meta-color': metaColor || undefined,
		'--atpx-badge-bg-color': badgeBgColor || undefined,
		'--atpx-badge-text-color': badgeTextColor || undefined,
		'--atpx-excerpt-font-size': `${ excerptFontSize }px`,
		'--atpx-card-bg-color': cardBgColor || undefined,
	};

	const blockProps = useBlockProps( {
		className: `atpx-layout-${ layoutType } atpx-style-${ cardStyle } atpx-spacing-${ spacing } atpx-shadow-${ shadow } atpx-ratio-${ aspectRatio }`,
		style: inlineStyles,
	} );

	// Date formatter helper
	const formatDate = ( dateString ) => {
		return new Date( dateString ).toLocaleDateString( undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		} );
	};

	const orderOfItems = contentOrder || [ 'image', 'meta', 'title', 'excerpt', 'readMore' ];
	const firstItem = orderOfItems[ 0 ];

	const renderSkeletonPart = ( part ) => {
		if ( part === 'image' && showImage && cardStyle !== 'style-2' ) {
			return <div className="atpx-skeleton-img"></div>;
		}
		if ( part === 'meta' && ( showDate || showAuthor ) ) {
			return <div className="atpx-skeleton-meta"></div>;
		}
		if ( part === 'title' ) {
			return <div className="atpx-skeleton-title"></div>;
		}
		if ( part === 'excerpt' && showExcerpt && cardStyle === 'style-1' ) {
			return (
				<div className="atpx-skeleton-text">
					<span></span>
					<span></span>
					<span></span>
				</div>
			);
		}
		if ( part === 'readMore' && showReadMore && cardStyle === 'style-1' ) {
			return <div className="atpx-skeleton-btn"></div>;
		}
		return null;
	};

	const renderCardPart = ( part, post, featuredImage, firstCategory, authorName ) => {
		if ( part === 'image' && showImage && cardStyle !== 'style-2' ) {
			return (
				<div className="atpx-post-image-wrapper">
					{ firstCategory && (
						<span className="atpx-post-category-tag">{ firstCategory }</span>
					) }
					{ featuredImage ? (
						<img src={ featuredImage } alt={ post.title.rendered } />
					) : (
						<div style={ {
							width: '100%',
							height: '100%',
							background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
						} }></div>
					) }
				</div>
			);
		}

		if ( part === 'meta' && ( showDate || showAuthor ) ) {
			return (
				<div className="atpx-post-meta">
					{ showDate && (
						<span className="atpx-post-date">{ formatDate( post.date ) }</span>
					) }
					{ showDate && showAuthor && <span className="atpx-meta-sep">•</span> }
					{ showAuthor && (
						<span className="atpx-post-author">By { authorName }</span>
					) }
				</div>
			);
		}

		if ( part === 'title' ) {
			return (
				<h3 className="atpx-post-title">
					<RawHTML>{ post.title.rendered }</RawHTML>
				</h3>
			);
		}

		if ( part === 'excerpt' && showExcerpt && cardStyle === 'style-1' ) {
			return (
				<div className="atpx-post-excerpt">
					<RawHTML>{ post.excerpt.rendered }</RawHTML>
				</div>
			);
		}

		if ( part === 'readMore' && showReadMore && cardStyle === 'style-1' ) {
			return (
				<span className="atpx-post-readmore">
					Read More
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
						<line x1="5" y1="12" x2="19" y2="12"></line>
						<polyline points="12 5 19 12 12 19"></polyline>
					</svg>
				</span>
			);
		}

		return null;
	};

	return (
		<>
			<InspectorControls>
				<TabPanel
					className="atpx-inspector-tabs"
					activeClass="is-active"
					tabs={ [
						{
							name: 'general',
							title: 'General',
							className: 'atpx-tab-general',
						},
						{
							name: 'style',
							title: 'Style',
							className: 'atpx-tab-style',
						},
					] }
				>
					{ ( tab ) => {
						if ( tab.name === 'general' ) {
							return (
								<>
									<PanelBody title="Content Settings" initialOpen={ true }>
										<SelectControl
											label="Layout Type"
											value={ layoutType }
											options={ [
												{ label: 'Grid Layout', value: 'grid' },
												{ label: 'List Layout', value: 'list' },
											] }
											onChange={ ( val ) => setAttributes( { layoutType: val } ) }
										/>

										<RangeControl
											label="Number of Posts"
											min={ 1 }
											max={ 20 }
											value={ numberOfPosts }
											onChange={ ( val ) => setAttributes( { numberOfPosts: val } ) }
										/>

										<ToggleControl
											label="Prioritize Sticky Posts"
											checked={ ! ignoreStickyPosts }
											onChange={ ( val ) => setAttributes( { ignoreStickyPosts: ! val } ) }
										/>

										<div style={ { marginBottom: '16px' } }>
											<span className="components-base-control__label" style={ { display: 'block', marginBottom: '8px' } }>
												Filter by Categories
											</span>
											{ categoriesList.length === 0 ? (
												<Spinner />
											) : (
												<div className="atpx-category-select-list">
													{ categoriesList.map( ( cat ) => (
														<div key={ cat.id } className="atpx-category-select-item">
															<input
																type="checkbox"
																id={ `atpx-editor-cat-${ cat.id }` }
																checked={ categories.includes( cat.id ) }
																onChange={ () => handleCategoryChange( cat.id ) }
															/>
															<label htmlFor={ `atpx-editor-cat-${ cat.id }` }>{ cat.name }</label>
														</div>
													) ) }
												</div>
											)}
										</div>

										<div style={ { marginBottom: '16px' } }>
											<span className="components-base-control__label" style={ { display: 'block', marginBottom: '8px' } }>
												Exclude Categories
											</span>
											{ categoriesList.length === 0 ? (
												<Spinner />
											) : (
												<div className="atpx-category-select-list">
													{ categoriesList.map( ( cat ) => (
														<div key={ cat.id } className="atpx-category-select-item">
															<input
																type="checkbox"
																id={ `atpx-editor-exclude-cat-${ cat.id }` }
																checked={ excludeCategories.includes( cat.id ) }
																onChange={ () => handleExcludeCategoryChange( cat.id ) }
															/>
															<label htmlFor={ `atpx-editor-exclude-cat-${ cat.id }` }>{ cat.name }</label>
														</div>
													) ) }
												</div>
											)}
										</div>

										<SelectControl
											label="Order"
											value={ order }
											options={ [
												{ label: 'Newest First', value: 'desc' },
												{ label: 'Oldest First', value: 'asc' },
											] }
											onChange={ ( val ) => setAttributes( { order: val } ) }
										/>

										<RangeControl
											label="Offset (Skip posts)"
											min={ 0 }
											max={ 10 }
											value={ offset }
											onChange={ ( val ) => setAttributes( { offset: val } ) }
										/>
									</PanelBody>

									<PanelBody title="Display Settings" initialOpen={ false }>
										<ToggleControl
											label="Show Featured Image"
											checked={ showImage }
											onChange={ ( val ) => setAttributes( { showImage: val } ) }
										/>
										<ToggleControl
											label="Show Excerpt"
											checked={ showExcerpt }
											onChange={ ( val ) => setAttributes( { showExcerpt: val } ) }
										/>
										<ToggleControl
											label="Show Date"
											checked={ showDate }
											onChange={ ( val ) => setAttributes( { showDate: val } ) }
										/>
										<ToggleControl
											label="Show Author"
											checked={ showAuthor }
											onChange={ ( val ) => setAttributes( { showAuthor: val } ) }
										/>
										<ToggleControl
											label="Show Read More Button"
											checked={ showReadMore }
											onChange={ ( val ) => setAttributes( { showReadMore: val } ) }
										/>
									</PanelBody>

									<PanelBody title="Drag / Manage Content Position" initialOpen={ true }>
										<p style={ { fontSize: '12px', color: '#64748b', marginBottom: '12px', lineHeight: '1.4' } }>
											Drag items or use the Up/Down buttons to reorder elements inside each post card:
										</p>
										<ReorderableItems
											items={ contentOrder || [ 'image', 'meta', 'title', 'excerpt', 'readMore' ] }
											onChange={ ( newOrder ) => setAttributes( { contentOrder: newOrder } ) }
										/>
									</PanelBody>
								</>
							);
						}

						if ( tab.name === 'style' ) {
							return (
								<>
									<PanelBody title="Layout & Design Settings" initialOpen={ true }>
										{ layoutType === 'grid' && (
											<SelectControl
												label="Grid Columns"
												value={ columns }
												options={ [
													{ label: '1 Column', value: 1 },
													{ label: '2 Columns', value: 2 },
													{ label: '3 Columns', value: 3 },
													{ label: '4 Columns', value: 4 },
												] }
												onChange={ ( val ) => setAttributes( { columns: parseInt( val, 10 ) } ) }
											/>
										) }

										<SelectControl
											label="Card Style"
											value={ cardStyle }
											options={ [
												{ label: 'Classic Blog Card', value: 'style-1' },
												{ label: 'Minimalist', value: 'style-2' },
												{ label: 'Magazine Overlay', value: 'style-3' },
											] }
											onChange={ ( val ) => setAttributes( { cardStyle: val } ) }
										/>

										<SelectControl
											label="Card Spacing"
											value={ spacing }
											options={ [
												{ label: 'Small', value: 'small' },
												{ label: 'Medium', value: 'medium' },
												{ label: 'Large', value: 'large' },
											] }
											onChange={ ( val ) => setAttributes( { spacing: val } ) }
										/>

										<RangeControl
											label="Border Radius"
											min={ 0 }
											max={ 30 }
											value={ borderRadius }
											onChange={ ( val ) => setAttributes( { borderRadius: val } ) }
										/>

										<SelectControl
											label="Shadow"
											value={ shadow }
											options={ [
												{ label: 'None', value: 'none' },
												{ label: 'Small', value: 'small' },
												{ label: 'Medium', value: 'medium' },
												{ label: 'Large', value: 'large' },
											] }
											onChange={ ( val ) => setAttributes( { shadow: val } ) }
										/>

										<SelectControl
											label="Image Aspect Ratio"
											value={ aspectRatio }
											options={ [
												{ label: '16:9 Wide', value: '16-9' },
												{ label: '4:3 Standard', value: '4-3' },
												{ label: '1:1 Square', value: '1-1' },
											] }
											onChange={ ( val ) => setAttributes( { aspectRatio: val } ) }
										/>
									</PanelBody>

									<PanelBody title="Typography Settings" initialOpen={ false }>
										<RangeControl
											label="Title Font Size (px)"
											min={ 12 }
											max={ 48 }
											value={ titleFontSize }
											onChange={ ( val ) => setAttributes( { titleFontSize: val } ) }
										/>
										<RangeControl
											label="Excerpt Font Size (px)"
											min={ 10 }
											max={ 24 }
											value={ excerptFontSize }
											onChange={ ( val ) => setAttributes( { excerptFontSize: val } ) }
										/>
									</PanelBody>

									<PanelColorSettings
										title="Color Settings"
										initialOpen={ false }
										colorSettings={ [
											{
												value: cardBgColor,
												onChange: ( val ) => setAttributes( { cardBgColor: val || '' } ),
												label: 'Card Background Color',
											},
											{
												value: titleColor,
												onChange: ( val ) => setAttributes( { titleColor: val || '' } ),
												label: 'Title Color',
											},
											{
												value: metaColor,
												onChange: ( val ) => setAttributes( { metaColor: val || '' } ),
												label: 'Meta Text Color',
											},
											{
												value: badgeBgColor,
												onChange: ( val ) => setAttributes( { badgeBgColor: val || '' } ),
												label: 'Category Badge Background',
											},
											{
												value: badgeTextColor,
												onChange: ( val ) => setAttributes( { badgeTextColor: val || '' } ),
												label: 'Category Badge Text',
											},
										] }
									/>
								</>
							);
						}
					} }
				</TabPanel>
			</InspectorControls>

			<div { ...blockProps }>
				{ posts === undefined && (
					<div className="atpx-skeleton-loader">
						{ Array.from( { length: Math.min( numberOfPosts, 3 ) } ).map( ( _, i ) => (
							<div key={ i } className="atpx-skeleton-card">
								{ firstItem === 'image' && renderSkeletonPart( 'image' ) }
								<div className="atpx-skeleton-content">
									{ orderOfItems.map( ( part ) => {
										if ( part === 'image' ) {
											return firstItem !== 'image' ? renderSkeletonPart( 'image' ) : null;
										}
										return renderSkeletonPart( part );
									} ) }
								</div>
							</div>
						) ) }
					</div>
				) }

				{ posts !== undefined && ( posts === null || posts.length === 0 ) && (
					<div className="atpx-empty-state">
						<p>
							{ categories && categories.length > 0
								? 'No articles available in this category.'
								: 'No posts found.' }
						</p>
					</div>
				) }

				{ posts !== undefined && posts !== null && posts.length > 0 && (
					posts.map( ( post ) => {
						// Extract author
						const authorName = post._embedded && post._embedded['author'] && post._embedded['author'][0]
							? post._embedded['author'][0].name
							: 'Admin';

						// Extract featured image
						const featuredImage = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]
							? post._embedded['wp:featuredmedia'][0].source_url
							: null;

						// Extract category name
						const postCats = post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0];
						const firstCategory = postCats && postCats.length > 0 ? postCats[0].name : '';

						return (
							<div key={ post.id } className="atpx-post-card">
								{ firstItem === 'image' && renderCardPart( 'image', post, featuredImage, firstCategory, authorName ) }

								<div className="atpx-post-content">
									{ orderOfItems.map( ( part ) => {
										if ( part === 'image' ) {
											return firstItem !== 'image' ? renderCardPart( 'image', post, featuredImage, firstCategory, authorName ) : null;
										}
										return renderCardPart( part, post, featuredImage, firstCategory, authorName );
									} ) }
								</div>
							</div>
						);
					} )
				) }
			</div>
		</>
	);
}
