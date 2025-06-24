import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import AutoDirection from 'calypso/components/auto-direction';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useSelector, useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/reader/sites/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { requestUser } from 'calypso/state/reader/users/actions';
import getReaderUser from 'calypso/state/selectors/get-reader-user';

import './styles.scss';

function HovercardContent( props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { user, gravatarData } = props;

	// Prefer wpcom_id when it is given. Sometimes ID is specific to another site and wpcom_id is
	// accurate. Use ID as a fallback as sometimes wpcom_id isn't provided (like self user data).
	const userID = user.wpcom_id || user.ID;

	// For some reason there are places where the user object passes in primary blog of -1. Lets
	// find the read one with this selector.
	const readerUserData = useSelector( ( state ) => getReaderUser( state, userID, true ) );
	const { display_name: displayName, user_login: userLogin } = readerUserData || {};
	const profileUrl = userLogin ? `/reader/users/${ userLogin }` : gravatarData.profileUrl;

	const primaryBlogId = readerUserData?.primary_blog || user?.primary_blog || user?.site_ID;
	const site = useSelector( ( state ) => getSite( state, primaryBlogId ) );
	const primaryBlogUrl = site?.URL;

	useEffect( () => {
		if ( ! userID ) {
			// This isnt a wpcom user, skip requesting data.
			return;
		}

		if ( ! site ) {
			dispatch( requestSite( primaryBlogId ) );
		}
		if ( ! readerUserData ) {
			dispatch( requestUser( userID, true ) );
		}
	}, [ userID, dispatch, site, primaryBlogId, readerUserData ] );

	return (
		<AutoDirection>
			{ /* Note AutoDirection needs a single child to work recursively, hence the wrapping fragments. */ }
			<>
				{ /* Use gravatar data in the header section since this is shown for all users, even those who do not have wpcom accounts */ }

				<div className="gravatar-hovercard__header">
					<a className="gravatar-hovercard__avatar-link" href={ profileUrl }>
						<img
							className="gravatar-hovercard__avatar"
							src={ gravatarData.avatarUrl }
							alt={ gravatarData.displayName }
							width={ 104 }
							height={ 104 }
						/>
					</a>

					<a className="gravatar-hovercard__name-link" href={ profileUrl }>
						<h4 className="gravatar-hovercard__name">{ gravatarData.displayName }</h4>
					</a>

					<p className="gravatar-hovercard__description">{ gravatarData.description }</p>
				</div>

				{ /* Below is custom for wpcom users, and can use wpcom data more freely */ }
				{ userID && (
					<>
						<div className="gravatar-hovercard__body">
							{ primaryBlogUrl && (
								<div className="gravatar-hovercard__primary-blog-card">
									<div className="gravatar-hovercard__primary-blog-card-header">
										<ReaderAvatar
											isCompact
											siteIcon={ site?.icon?.img || site?.icon?.ico }
											className="gravatar-hovercard__primary-blog-card-site-icon"
										/>
										<div className="gravatar-hovercard__primary-blog-card-site-info">
											<h5 className="gravatar-hovercard__primary-blog-card-site-title">
												{ site.title }
											</h5>

											{ displayName && (
												<p className="gravatar-hovercard__primary-blog-card-username">
													{ translate( 'By %(displayName)s', {
														args: {
															displayName: displayName || '',
														},
													} ) }
												</p>
											) }
										</div>
									</div>

									<p className="gravatar-hovercard__primary-blog-card-description">
										{ site?.description }
									</p>

									<ReaderFollowButton
										className="gravatar-hovercard__primary-blog-card-follow-button"
										siteUrl={ primaryBlogUrl }
										hasButtonStyle
										followSource="gravatar-hovercard"
									/>
								</div>
							) }
						</div>

						<div className="gravatar-hovercard__footer">
							{ /* TODO: Add recommended blogs list */ }
						</div>
					</>
				) }
			</>
		</AutoDirection>
	);
}

export default function HovercardContentPortal( { mountNode, ...props } ) {
	if ( ! mountNode ) {
		return null;
	}

	return ReactDOM.createPortal( <HovercardContent { ...props } />, mountNode );
}
