/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function LoadingPlaceholder() {
	return (
		<div className="editor__placeholder">
			<div className="edit-post-layout">
				<div className="edit-post-header">
					<div className="edit-post-header-toolbar">
						<div className="placeholder placeholder-site">Placeholder</div>
					</div>
					<div className="edit-post-header__settings">
						<div className="placeholder placeholder-button">Placeholder</div>
						<div className="placeholder placeholder-button">Placeholder</div>
						<div className="placeholder placeholder-button">Placeholder</div>
					</div>
				</div>
				<div className="edit-post-layout__content">
					<div className="edit-post-visual-editor editor-styles-wrapper">
						<div className="editor-writing-flow">
							<div className="editor-post-title">
								<div className="placeholder placeholder-title wp-block editor-post-title__block">
									Placeholder
								</div>
								<div className="editor-post-title__text">Your site is being created...</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
