import { Button, Icon, IconType } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

import './style.scss';

export interface Permission {
	icon?: IconType;
	label: ReactNode;
}

export interface PermissionsListProps {
	title?: ReactNode;
	permissions: Permission[];
	maxVisible?: number;
	learnMoreText?: ReactNode;
	learnMoreUrl?: string;
	className?: string;
}

/**
 * Expandable permissions list with optional icons
 * @example
 * <PermissionsList
 *   title="This app will be able to:"
 *   permissions={[
 *     { icon: 'view', label: 'View your profile' },
 *     { icon: 'edit', label: 'Edit your posts' },
 *     { icon: 'manage', label: 'Manage settings' },
 *   ]}
 *   maxVisible={2}
 * />
 */
export function PermissionsList( {
	title,
	permissions,
	maxVisible = 4,
	learnMoreText,
	learnMoreUrl,
	className,
}: PermissionsListProps ): JSX.Element {
	const translate = useTranslate();
	const [ isExpanded, setIsExpanded ] = useState( false );

	const hasOverflow = permissions.length > maxVisible;
	const visiblePermissions = isExpanded ? permissions : permissions.slice( 0, maxVisible );
	const hiddenCount = permissions.length - maxVisible;

	const renderIcon = ( permission: Permission ) => {
		if ( ! permission.icon ) {
			return <span className="connect-screen-permissions-list__icon-placeholder" />;
		}

		return (
			<span className="connect-screen-permissions-list__icon">
				<Icon icon={ permission.icon } size={ 20 } />
			</span>
		);
	};

	return (
		<div className={ clsx( 'connect-screen-permissions-list', className ) }>
			{ title && <h3 className="connect-screen-permissions-list__title">{ title }</h3> }
			<ul className="connect-screen-permissions-list__items">
				{ visiblePermissions.map( ( permission, index ) => (
					<li key={ index } className="connect-screen-permissions-list__item">
						{ renderIcon( permission ) }
						<span className="connect-screen-permissions-list__label">{ permission.label }</span>
					</li>
				) ) }
			</ul>
			{ hasOverflow && ! isExpanded && (
				<Button
					variant="link"
					onClick={ () => setIsExpanded( true ) }
					className="connect-screen-permissions-list__expand"
				>
					{ translate( '%(count)d more', {
						args: { count: hiddenCount },
						comment: 'Button to show more permissions. e.g., "3 more"',
					} ) }
					<Icon icon={ chevronDown } size={ 20 } />
				</Button>
			) }
			{ hasOverflow && isExpanded && (
				<Button
					variant="link"
					onClick={ () => setIsExpanded( false ) }
					className="connect-screen-permissions-list__collapse"
				>
					{ translate( 'Show less' ) }
					<Icon icon={ chevronDown } size={ 20 } />
				</Button>
			) }
			{ learnMoreText && learnMoreUrl && (
				<Button
					variant="link"
					href={ learnMoreUrl }
					target="_blank"
					className="connect-screen-permissions-list__learn-more"
				>
					{ learnMoreText }
				</Button>
			) }
		</div>
	);
}
