import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';

interface Props {
	heading: string;
	description: string;
	imageSrc: string;
	link: string;
	pageNumber: number;
	isLastPage: boolean;
}

const WhatsNewPage: React.FC< Props > = ( {
	heading,
	description,
	imageSrc,
	isLastPage,
	link,
	pageNumber,
} ) => {
	const __ = useI18n().__;

	useEffect( () => {
		recordTracksEvent( 'calypso_whats_new_slide_view', {
			slide_number: pageNumber,
			is_last_slide: isLastPage,
		} );
	}, [ isLastPage, pageNumber ] );

	return (
		<div className="whats-new-page__container">
			<div className="whats-new-page__text">
				{ heading && <h1 className="whats-new-page__heading">{ heading }</h1> }
				<div className="whats-new-page__description">
					{ /* eslint-disable-next-line react/no-danger */ }
					{ description && <p dangerouslySetInnerHTML={ { __html: description } } /> }
					{ link && (
						<Button className="whats-new-page__link" href={ link } variant="link" target="_blank">
							{ /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */ }
							{ /* @ts-ignore This is declared as a global variable and provided by webpack. */ }
							{ __( 'Learn more', __i18n_text_domain__ ) }
						</Button>
					) }
				</div>
			</div>
			<div className="whats-new-page__visual">
				{ imageSrc && (
					<div className="whats-new-page__image-container">
						<img
							src={ imageSrc }
							alt={ description }
							aria-hidden="true"
							className="whats-new-page__image"
						/>
					</div>
				) }
			</div>
		</div>
	);
};

export default WhatsNewPage;
