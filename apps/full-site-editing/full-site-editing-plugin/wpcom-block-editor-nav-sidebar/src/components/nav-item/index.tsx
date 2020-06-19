/**
 * External dependencies
 */
import classNames from 'classnames';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Post } from '../../types';
import './style.scss';

interface NavItemProps {
	item: Post;
	selected: boolean;
	statusLabel?: string;
}

export default function NavItem( { item, selected, statusLabel }: NavItemProps ) {
	const buttonClasses = classNames( 'wpcom-block-editor-nav-item', {
		'is-selected': selected,
	} );

	const titleClasses = classNames( 'wpcom-block-editor-nav-item__title', {
		'is-untitled': ! item.title?.raw,
	} );

	return (
		<li>
			<Button className={ buttonClasses }>
				<div className="wpcom-block-editor-nav-item__title-container">
					<div className={ titleClasses }>
						{ item.title?.raw || __( 'Untitled', 'full-site-editing' ) }
					</div>
					{ item.slug && (
						<div className="wpcom-block-editor-nav-item__slug">{ `/${ item.slug }/` }</div>
					) }
				</div>
				{ statusLabel && <div className="wpcom-block-editor-nav-item__label">{ statusLabel }</div> }
			</Button>
		</li>
	);
}
