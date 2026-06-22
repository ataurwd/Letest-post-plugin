import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import './editor.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

// Custom brand block icon representing grid and list layout elements.
const showcaseIcon = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="3" y="3" width="7" height="7" rx="1.5" fill="#2563eb" />
		<rect x="12" y="4.5" width="9" height="4" rx="1" fill="#64748b" />
		<rect x="3" y="14" width="7" height="7" rx="1.5" fill="#64748b" />
		<rect x="12" y="15.5" width="9" height="4" rx="1" fill="#2563eb" />
	</svg>
);

registerBlockType( metadata.name, {
	icon: showcaseIcon,
	edit: Edit,
	save: Save,
} );
