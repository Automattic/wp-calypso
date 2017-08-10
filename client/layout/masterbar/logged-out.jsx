/** @format */
/**
 * External dependencies
 */
import React from 'react';
import Masterbar from './masterbar';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Item from './item';
import config from 'config';
import { login } from 'lib/paths';

function getLoginUrl( redirectUri ) {
	const params = {};
	if ( redirectUri ) {
		params.redirectTo = redirectUri;
	} else if ( typeof window !== 'undefined' ) {
		params.redirectTo = window.location.href;
	}

	return login( params );
}

const MasterbarLoggedOut = ( { title, sectionName, translate, redirectUri } ) =>
	<Masterbar>
		<Item className="masterbar__item-logo">
			<svg
				className="masterbar__wpcom-logo"
				width="270"
				height="45"
				viewBox="0 0 270 45"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g fill="#FFF" fillRule="evenodd">
					<path d="M32.61 39.912L38.78 22.08c1.153-2.88 1.536-5.184 1.536-7.232 0-.744-.05-1.434-.136-2.077 1.576 2.877 2.473 6.178 2.473 9.69 0 7.448-4.036 13.952-10.04 17.452zm-7.368-26.92c1.216-.065 2.31-.193 2.31-.193 1.09-.13.96-1.728-.128-1.665 0 0-3.27.257-5.382.257-1.984 0-5.318-.257-5.318-.257-1.09-.063-1.217 1.6-.128 1.664 0 0 1.03.127 2.118.19l3.145 8.62-4.42 13.254-7.353-21.873c1.217-.063 2.31-.19 2.31-.19 1.09-.13.96-1.728-.128-1.665 0 0-3.27.257-5.383.257-.378 0-.825-.01-1.3-.025 3.61-5.48 9.817-9.1 16.872-9.1 5.256 0 10.042 2.01 13.635 5.3-.087-.005-.172-.016-.262-.016-1.983 0-3.39 1.73-3.39 3.585 0 1.664.96 3.072 1.983 4.736.768 1.346 1.665 3.074 1.665 5.57 0 1.73-.512 3.903-1.536 6.528l-2.014 6.73-7.298-21.707zM22.46 42.653c-1.983 0-3.896-.292-5.705-.823l6.06-17.605L29.02 41.23c.04.1.09.19.145.278-2.1.74-4.354 1.146-6.706 1.146zM2.266 22.46c0-2.93.628-5.708 1.748-8.22l9.632 26.392C6.91 37.36 2.267 30.452 2.267 22.46zM22.46 0C10.074 0 0 10.075 0 22.46c0 12.384 10.075 22.46 22.46 22.46 12.383 0 22.458-10.076 22.458-22.46C44.918 10.074 34.843 0 22.458 0zM72.754 33.694h-2.582l-4.535-15.05c-.215-.665-.456-1.506-.722-2.52-.267-1.015-.405-1.625-.415-1.83-.226 1.353-.585 2.834-1.076 4.443l-4.397 14.957h-2.582l-5.98-22.474h2.767l3.55 13.88c.492 1.948.85 3.71 1.077 5.29.276-1.877.685-3.71 1.228-5.505l4.028-13.665h2.767l4.227 13.788c.492 1.59.907 3.382 1.245 5.38.195-1.454.564-3.227 1.107-5.318l3.536-13.85h2.767l-6.01 22.474zM81.875 25.255c0 2.15.43 3.79 1.292 4.92.86 1.126 2.126 1.69 3.797 1.69 1.67 0 2.938-.562 3.804-1.684.866-1.12 1.3-2.763 1.3-4.925 0-2.142-.434-3.77-1.3-4.88-.866-1.113-2.144-1.67-3.835-1.67-1.67 0-2.93.55-3.782 1.646-.85 1.097-1.275 2.732-1.275 4.905m12.836 0c0 2.746-.69 4.89-2.074 6.433C91.252 33.23 89.34 34 86.902 34c-1.507 0-2.844-.353-4.012-1.06-1.168-.707-2.07-1.72-2.705-3.043-.636-1.322-.953-2.87-.953-4.642 0-2.747.686-4.886 2.06-6.42 1.372-1.53 3.278-2.296 5.718-2.296 2.356 0 4.23.782 5.618 2.35 1.39 1.568 2.083 3.69 2.083 6.365M105.768 16.54c.748 0 1.42.06 2.014.183l-.354 2.367c-.697-.153-1.312-.23-1.844-.23-1.364 0-2.53.553-3.498 1.66-.968 1.107-1.452 2.485-1.452 4.135v9.04h-2.552v-16.85h2.106l.292 3.12h.123c.625-1.095 1.378-1.94 2.26-2.535.88-.594 1.85-.89 2.905-.89M116.51 31.864c1.742 0 3.005-.474 3.79-1.422.783-.947 1.175-2.477 1.175-4.588v-.538c0-2.388-.397-4.092-1.19-5.11-.795-1.02-2.064-1.53-3.806-1.53-1.497 0-2.643.58-3.436 1.744-.795 1.163-1.192 2.805-1.192 4.927 0 2.152.395 3.776 1.184 4.872.79 1.096 1.947 1.644 3.474 1.644zm5.104-.43h-.14c-1.177 1.71-2.94 2.567-5.287 2.567-2.204 0-3.917-.752-5.14-2.26-1.226-1.505-1.84-3.647-1.84-6.424 0-2.777.616-4.934 1.846-6.472 1.23-1.537 2.94-2.305 5.134-2.305 2.285 0 4.038.828 5.257 2.49h.2l-.107-1.216-.062-1.183V9.776h2.552v23.92h-2.075l-.338-2.26zM131.49 22.61h2.353c2.316 0 3.99-.374 5.026-1.122 1.034-.748 1.552-1.947 1.552-3.597 0-1.485-.487-2.59-1.46-3.32-.974-.727-2.49-1.09-4.55-1.09h-2.92v9.13zm11.637-4.842c0 2.275-.776 4.025-2.328 5.25-1.554 1.225-3.775 1.837-6.666 1.837h-2.643v8.84h-2.612V11.22h5.826c5.615 0 8.423 2.183 8.423 6.548zM154.03 16.54c.75 0 1.42.06 2.015.183l-.353 2.367c-.698-.153-1.312-.23-1.845-.23-1.363 0-2.53.553-3.498 1.66-.97 1.107-1.453 2.485-1.453 4.135v9.04h-2.552v-16.85h2.106l.293 3.12h.123c.625-1.095 1.38-1.94 2.26-2.535.88-.594 1.85-.89 2.905-.89M164.677 18.675c-1.352 0-2.43.44-3.236 1.322-.803.882-1.277 2.1-1.42 3.66h8.808c0-1.61-.36-2.842-1.077-3.698-.716-.857-1.74-1.285-3.073-1.285M165.37 34c-2.49 0-4.456-.757-5.896-2.274-1.44-1.517-2.16-3.623-2.16-6.318 0-2.716.67-4.873 2.006-6.472 1.338-1.598 3.133-2.398 5.388-2.398 2.11 0 3.78.695 5.01 2.083 1.23 1.39 1.846 3.222 1.846 5.497v1.614h-11.606c.05 1.98.55 3.48 1.5 4.505.947 1.025 2.282 1.537 4.003 1.537 1.815 0 3.608-.38 5.38-1.137v2.275c-.9.39-1.754.668-2.558.837-.805.17-1.776.254-2.913.254M186.467 29.097c0 1.568-.584 2.778-1.752 3.628-1.17.85-2.808 1.276-4.92 1.276-2.234 0-3.975-.353-5.226-1.06v-2.367c.81.41 1.677.733 2.605.97.928.234 1.82.352 2.683.352 1.33 0 2.356-.212 3.074-.638.717-.425 1.076-1.073 1.076-1.945 0-.655-.285-1.216-.854-1.683-.568-.467-1.678-1.018-3.328-1.653-1.567-.584-2.682-1.094-3.343-1.53-.66-.435-1.153-.93-1.476-1.483-.322-.553-.484-1.214-.484-1.983 0-1.372.56-2.456 1.676-3.25 1.115-.794 2.648-1.19 4.595-1.19 1.814 0 3.587.367 5.32 1.105l-.908 2.075c-1.69-.696-3.223-1.045-4.596-1.045-1.21 0-2.12.19-2.736.57-.615.378-.922.9-.922 1.567 0 .45.115.835.346 1.153.23.318.602.62 1.114.907.512.287 1.496.702 2.952 1.245 1.998.727 3.348 1.46 4.05 2.198s1.053 1.665 1.053 2.782M201.17 29.097c0 1.568-.583 2.778-1.752 3.628-1.168.85-2.808 1.276-4.92 1.276-2.233 0-3.975-.353-5.225-1.06v-2.367c.81.41 1.678.733 2.605.97.928.234 1.822.352 2.683.352 1.333 0 2.358-.212 3.075-.638.717-.425 1.076-1.073 1.076-1.945 0-.655-.283-1.216-.852-1.683-.57-.467-1.678-1.018-3.328-1.653-1.568-.584-2.683-1.094-3.343-1.53-.66-.435-1.154-.93-1.476-1.483-.322-.553-.483-1.214-.483-1.983 0-1.372.558-2.456 1.675-3.25s2.65-1.19 4.596-1.19c1.814 0 3.587.367 5.32 1.105l-.908 2.075c-1.69-.696-3.223-1.045-4.596-1.045-1.21 0-2.12.19-2.736.57-.615.378-.923.9-.923 1.567 0 .45.116.835.346 1.153.232.318.603.62 1.116.907.512.287 1.496.702 2.95 1.245 2 .727 3.35 1.46 4.052 2.198.702.738 1.053 1.665 1.053 2.782M205.267 32.064c0-.686.156-1.206.47-1.56.31-.354.76-.53 1.344-.53.595 0 1.06.176 1.392.53.333.354.5.874.5 1.56 0 .667-.17 1.18-.507 1.537-.34.36-.8.54-1.384.54-.522 0-.955-.162-1.298-.485-.343-.323-.515-.853-.515-1.59M219.897 34c-2.44 0-4.328-.75-5.665-2.25-1.337-1.502-2.006-3.626-2.006-6.373 0-2.818.68-4.996 2.037-6.533 1.358-1.537 3.292-2.305 5.803-2.305.81 0 1.62.086 2.428.26.81.174 1.445.38 1.907.615l-.783 2.167c-.564-.225-1.18-.412-1.845-.56-.666-.15-1.255-.224-1.768-.224-3.423 0-5.134 2.183-5.134 6.55 0 2.07.417 3.657 1.252 4.764.836 1.107 2.073 1.66 3.713 1.66 1.404 0 2.844-.302 4.32-.907v2.26c-1.128.584-2.547.876-4.258.876M229.385 25.255c0 2.15.43 3.79 1.292 4.92.86 1.126 2.126 1.69 3.797 1.69 1.67 0 2.938-.562 3.804-1.684.866-1.12 1.3-2.763 1.3-4.925 0-2.142-.434-3.77-1.3-4.88-.866-1.113-2.144-1.67-3.835-1.67-1.67 0-2.93.55-3.782 1.646-.85 1.097-1.275 2.732-1.275 4.905m12.836 0c0 2.746-.69 4.89-2.074 6.433C238.763 33.23 236.85 34 234.412 34c-1.506 0-2.844-.353-4.012-1.06-1.168-.707-2.07-1.72-2.705-3.043-.636-1.322-.953-2.87-.953-4.642 0-2.747.686-4.886 2.06-6.42 1.373-1.53 3.278-2.296 5.718-2.296 2.357 0 4.23.782 5.618 2.35 1.39 1.568 2.083 3.69 2.083 6.365M266.91 33.694v-10.96c0-1.343-.288-2.35-.86-3.02-.576-.672-1.467-1.008-2.676-1.008-1.59 0-2.762.456-3.52 1.368-.76.912-1.138 2.316-1.138 4.212v9.408h-2.55v-10.96c0-1.343-.29-2.35-.863-3.02-.573-.672-1.47-1.008-2.69-1.008-1.598 0-2.77.48-3.512 1.437-.742.958-1.113 2.53-1.113 4.712v8.84h-2.552v-16.85h2.075l.415 2.307h.123c.482-.82 1.16-1.46 2.037-1.922.876-.46 1.857-.69 2.944-.69 2.632 0 4.354.952 5.163 2.858h.123c.502-.882 1.23-1.578 2.183-2.09.952-.513 2.04-.77 3.258-.77 1.906 0 3.333.49 4.28 1.47.95.977 1.423 2.543 1.423 4.695v10.99h-2.55z" />
				</g>
			</svg>
		</Item>
		<Item className="masterbar__item-title">
			{ title }
		</Item>
		<div className="masterbar__login-links">
			{ 'signup' !== sectionName
				? <Item url={ config( 'signup_url' ) }>
						{ translate( 'Sign Up', {
							context: 'Toolbar',
							comment: 'Should be shorter than ~12 chars',
						} ) }
					</Item>
				: null }

			{ 'login' !== sectionName
				? <Item url={ getLoginUrl( redirectUri ) }>
						{ translate( 'Log In', {
							context: 'Toolbar',
							comment: 'Should be shorter than ~12 chars',
						} ) }
					</Item>
				: null }
		</div>
	</Masterbar>;

MasterbarLoggedOut.propTypes = {
	title: React.PropTypes.string,
	sectionName: React.PropTypes.string,
	redirectUri: React.PropTypes.string,
};

MasterbarLoggedOut.defaultProps = {
	title: '',
	sectionName: '',
};

export default localize( MasterbarLoggedOut );
