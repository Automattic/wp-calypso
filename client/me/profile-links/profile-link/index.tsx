import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import safeProtocolUrl from 'calypso/lib/safe-protocol-url';
import { withoutHttp } from 'calypso/lib/url';
import { recordGoogleEvent as recordGoogleEventAction } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { useDeleteProfileLinkMutation } from '../data/use-delete-profile-link-mutation';

import './style.scss';

type ProfileLinkProps = {
	imageSize?: number;
	title: string;
	url: string;
	slug: string;
	isPlaceholder?: boolean;
};

const NOTICE_DURATION = 5000;

function ProfileLink( {
	imageSize = 100,
	title,
	url,
	slug,
	isPlaceholder = false,
}: ProfileLinkProps ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { deleteProfileLink, isLoading: isRemoving } = useDeleteProfileLinkMutation( {
		onSuccess: ( data, { linkSlug } ) => {
			dispatch(
				successNotice(
					translate( '%s removed from your profile links successfully.', { args: [ url ] } ),
					{
						id: `profile-links-${ linkSlug }`,
						duration: NOTICE_DURATION,
					}
				)
			);
		},
	} );

	const recordClickEvent = ( action: string ) =>
		dispatch( recordGoogleEventAction( 'Me', 'Clicked on ' + action ) );

	const handleRemoveButtonClick = () => {
		if ( isRemoving ) {
			return;
		}
		recordClickEvent( 'Remove Link Next to Site' );
		deleteProfileLink( slug );
	};

	const classes = classNames( [ 'profile-link' ], { 'is-placeholder': isPlaceholder } );
	const imageSrc =
		'//s1.wp.com/mshots/v1/' + encodeURIComponent( url ) + '?w=' + imageSize + '&h=64';
	const linkHref = isPlaceholder ? null : safeProtocolUrl( url );

	return (
		<li className={ classes }>
			{ isPlaceholder ? (
				<div className="profile-link__image-link" />
			) : (
				<a
					href={ linkHref }
					className="profile-link__image-link"
					target="_blank"
					rel="noopener noreferrer"
					onClick={ () => recordClickEvent( 'Profile Links Site Images Link' ) }
				>
					<img className="profile-link__image" src={ imageSrc } alt={ `Thumbnail for ${ url }` } />
				</a>
			) }
			<a
				href={ linkHref }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ () => recordClickEvent( 'Profile Links Site Link' ) }
			>
				<span className="profile-link__title">{ title }</span>
				<span className="profile-link__url">{ withoutHttp( url ) }</span>
			</a>

			{ ! isPlaceholder ? (
				<Button
					borderless
					className="profile-link__remove"
					onClick={ handleRemoveButtonClick }
					disabled={ isRemoving }
				>
					<Gridicon icon="cross" />
				</Button>
			) : null }
		</li>
	);
}

export default ProfileLink;
