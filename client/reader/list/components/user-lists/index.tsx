import './style.scss';

import { SummaryButton } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import type { List } from 'calypso/reader/list-manage/types';
import type { JSX, ReactNode } from 'react';

interface UserListsProps {
	lists: List[];
	isLoading: boolean;
}

export const UserLists = ( { lists, isLoading }: UserListsProps ): JSX.Element => {
	const translate = useTranslate();

	if ( isLoading ) {
		return (
			<div className="wp-spinner-wrapper">
				<Spinner /> { translate( 'Loading lists' ) }...
			</div>
		);
	}

	if ( lists.length === 0 ) {
		return (
			<div className="reader-lists">
				<EmptyContent
					illustration={ null }
					icon={ <Icon icon={ formatListBullets } size={ 48 } /> }
					title={ null }
					line={ translate( 'No lists yet.' ) }
				/>
			</div>
		);
	}

	return (
		<div className="reader-lists">
			{ lists.map( ( list: List ) => {
				let description: ReactNode = list.description;

				if ( list.slug === 'recommended-blogs' ) {
					description = translate( 'A list of blogs recommended by %s.', {
						args: `@${ list.owner }`,
					} );
				}

				return (
					<SummaryButton
						key={ `user-list-${ list.ID }` }
						href={ `/reader/list/${ list.owner }/${ list.slug }` }
						title={ list.title }
						description={ description || translate( 'No description.' ) }
					/>
				);
			} ) }
		</div>
	);
};
