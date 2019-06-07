/* global fullSiteEditing */
/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import './style.scss';

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<defs>
			<path
				d="M7.11 19.72L7.3 23.01L12.73 20.72L16.45 23.47L17.8 19.72L22.16 20.29L19.92 17.17C24.27 9.25 21.87 5.1 12.73 4.72C-0.99 4.15 5.67 13.97 5.81 16.11C5.91 17.54 4.66 19.24 2.06 21.21L7.11 19.72Z"
				id="b5l2nBA81"
			/>
			<path
				d="M14.11 10.71C14.11 12.94 12.38 14.76 10.25 14.76C8.12 14.76 6.4 12.94 6.4 10.71C6.4 8.48 8.12 6.67 10.25 6.67C12.38 6.67 14.11 8.48 14.11 10.71Z"
				id="f38f7IU0pl"
			/>
			<path
				d="M20.16 11.01C20.16 13.24 18.43 15.05 16.3 15.05C14.17 15.05 12.44 13.24 12.44 11.01C12.44 8.78 14.17 6.96 16.3 6.96C18.43 6.96 20.16 8.78 20.16 11.01Z"
				id="cwWjpt0Gx"
			/>
			<path
				d="M12.63 10.71C12.63 12.02 11.56 13.09 10.25 13.09C8.94 13.09 7.87 12.02 7.87 10.71C7.87 9.4 8.94 8.33 10.25 8.33C11.56 8.33 12.63 9.4 12.63 10.71Z"
				id="hut18uuvu"
			/>
			<path
				d="M18.68 11.01C18.68 12.32 17.61 13.38 16.3 13.38C14.99 13.38 13.92 12.32 13.92 11.01C13.92 9.69 14.99 8.63 16.3 8.63C17.61 8.63 18.68 9.69 18.68 11.01Z"
				id="a5LtOD2rS"
			/>
		</defs>
		<g>
			<g>
				<g>
					<use xlinkHref="#b5l2nBA81" opacity="1" fill="#4084e6" fillOpacity="1" />
					<g>
						<use
							xlinkHref="#b5l2nBA81"
							opacity="1"
							fillOpacity="0"
							stroke="#509e47"
							strokeWidth="0"
							strokeOpacity="1"
						/>
					</g>
				</g>
				<g>
					<use xlinkHref="#f38f7IU0pl" opacity="1" fill="#ffffff" fillOpacity="1" />
				</g>
				<g>
					<use xlinkHref="#cwWjpt0Gx" opacity="1" fill="#ffffff" fillOpacity="1" />
				</g>
				<g>
					<use xlinkHref="#hut18uuvu" opacity="1" fill="#000000" fillOpacity="1" />
				</g>
				<g>
					<use xlinkHref="#a5LtOD2rS" opacity="1" fill="#000000" fillOpacity="1" />
				</g>
			</g>
		</g>
	</svg>
);

if ( 'wp_template' === fullSiteEditing.editorPostType ) {
	registerBlockType( 'a8c/site-title', {
		title: __( 'Site Title' ),
		description: __( 'Placeholder for your site title.' ),
		icon,
		category: 'layout',
		supports: {
			html: false,
			multiple: false,
			reusable: false,
		},
		edit,
		save: () => null,
	} );
}
