import clsx from 'clsx';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import { formatDate } from './format-note-time';
import type { NoteView } from './note-view';

export const ContextCard = ( {
	title,
	description,
	icon,
	url,
}: NonNullable< NoteView[ 'card' ] > ) => {
	const content = (
		<>
			{ icon && <NoteIcon className="wpnc-simplified__card-icon" icon={ icon } size={ 40 } /> }
			<div className="wpnc-simplified__card-text">
				<div className="wpnc-simplified__card-title">{ title }</div>
				{ description && <div className="wpnc-simplified__card-excerpt">{ description }</div> }
			</div>
		</>
	);

	return url ? (
		<a className="wpnc-simplified__card" href={ url } target="_blank" rel="noreferrer">
			{ content }
		</a>
	) : (
		<div className="wpnc-simplified__card">{ content }</div>
	);
};

export const PostCard = ( {
	title,
	excerpt,
	url,
	isFeatured,
	image,
	siteName,
	siteIcon,
	author,
	date,
}: NonNullable< NoteView[ 'post' ] > ) => {
	const { locale } = useAppContext();
	const byline = [ author, date && formatDate( date, locale ) ].filter( Boolean ).join( ' · ' );

	// A post that is the news shows its image, under a row that already says who
	// published it and when. Anywhere else it is a reference, introduced by its site.
	return (
		<a
			className={ clsx( 'wpnc-simplified__card', { 'is-featured': isFeatured } ) }
			href={ url }
			target="_blank"
			rel="noreferrer"
		>
			{ isFeatured && image && (
				<img className="wpnc-simplified__card-image" src={ image } alt="" />
			) }
			<div className="wpnc-simplified__card-text">
				{ ! isFeatured && (
					<span className="wpnc-simplified__card-arrow" aria-hidden="true">
						&#8599;
					</span>
				) }
				{ ! isFeatured && ( siteName || byline ) && (
					<div className="wpnc-simplified__card-source">
						{ siteIcon && (
							<img className="wpnc-simplified__card-site-icon" src={ siteIcon } alt="" />
						) }
						<div className="wpnc-simplified__card-source-text">
							{ siteName && <span className="wpnc-simplified__card-site">{ siteName }</span> }
							{ byline && <span>{ byline }</span> }
						</div>
					</div>
				) }
				{ title && <div className="wpnc-simplified__card-title">{ title }</div> }
				{ excerpt && <div className="wpnc-simplified__card-excerpt">{ excerpt }</div> }
			</div>
		</a>
	);
};
