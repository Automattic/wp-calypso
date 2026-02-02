import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import './post-navigation.scss';

const NavigationButton = ( { direction, post, postKey, onNavigate, translate } ) => {
	const isNext = direction === 'next';
	const label = isNext ? translate( 'Next post' ) : translate( 'Previous post' );
	const icon = isNext ? 'chevron-right' : 'chevron-left';

	if ( ! postKey ) {
		return <div className="reader-full-post-navigation__link-placeholder" />;
	}

	return (
		<button
			type="button"
			onClick={ () => onNavigate( postKey ) }
			className={ clsx(
				'reader-full-post-navigation__link-button',
				isNext && 'reader-full-post-navigation__link-button--next'
			) }
			aria-label={ translate( '%(label)s: %(title)s', {
				args: { label, title: post?.title || label },
			} ) }
		>
			{ ! isNext && <Gridicon icon={ icon } size={ 18 } /> }
			<div className="reader-full-post-navigation__link-content">
				<span className="reader-full-post-navigation__link-label">{ label }</span>
				<span className="reader-full-post-navigation__link-title">
					{ post?.title || translate( 'Loading…' ) }
				</span>
			</div>
			{ isNext && <Gridicon icon={ icon } size={ 18 } /> }
		</button>
	);
};

NavigationButton.propTypes = {
	direction: PropTypes.oneOf( [ 'previous', 'next' ] ).isRequired,
	post: PropTypes.object,
	postKey: PropTypes.object,
	onNavigate: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

const ReaderFullPostNavigation = ( {
	previousPost,
	nextPost,
	previousPostKey,
	nextPostKey,
	onNavigate,
} ) => {
	const translate = useTranslate();

	if ( ! previousPostKey && ! nextPostKey ) {
		return null;
	}

	return (
		<div className="reader-full-post-navigation">
			<div className="reader-full-post-navigation__divider" />

			<div className="reader-full-post-navigation__links">
				<div className="reader-full-post-navigation__link reader-full-post-navigation__link--previous">
					<NavigationButton
						direction="previous"
						post={ previousPost }
						postKey={ previousPostKey }
						onNavigate={ onNavigate }
						translate={ translate }
					/>
				</div>

				<div className="reader-full-post-navigation__link reader-full-post-navigation__link--next">
					<NavigationButton
						direction="next"
						post={ nextPost }
						postKey={ nextPostKey }
						onNavigate={ onNavigate }
						translate={ translate }
					/>
				</div>
			</div>
		</div>
	);
};

ReaderFullPostNavigation.propTypes = {
	previousPost: PropTypes.object,
	nextPost: PropTypes.object,
	previousPostKey: PropTypes.object,
	nextPostKey: PropTypes.object,
	onNavigate: PropTypes.func.isRequired,
};

export default ReaderFullPostNavigation;
