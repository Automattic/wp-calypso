/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useJetpackSearchAIQuery } from '@automattic/data-stores';
import { external, Icon, page } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { stripHTML } from 'calypso/lib/formatting';
export const SITE_STORE = 'automattic/site' as const;
import './help-center-article-content.scss';

type Props = {
	message: string;
	setLoadingState: CallableFunction;
};

export function HelpCenterGPT( { message = '', setLoadingState }: Props ) {
	const { __ } = useI18n();

	const { data, isFetching } = useJetpackSearchAIQuery( '9619154', message, 'response' );
	// Report loading state up.
	useEffect( () => {
		if ( setLoadingState ) {
			setLoadingState( isFetching );
		}
	}, [ isFetching, setLoadingState, message ] );

	return (
		<div className="help-center-sibyl-articles__container">
			<h3 id="help-center--contextual_help" className="help-center__section-title">
				{ __( 'Quick response', __i18n_text_domain__ ) }
			</h3>
			<div className="help-center-gpt-response">
				{ data?.response && stripHTML( data.response ) }
			</div>
			<h3 id="help-center--contextual_help" className="help-center__section-title">
				{ __( 'Relevant resources', __i18n_text_domain__ ) }
			</h3>
			<ul
				className="help-center-sibyl-articles__list"
				aria-labelledby="help-center--contextual_help"
			>
				{ data?.urls?.map( ( article ) => {
					return (
						<li key={ article.url }>
							<a href={ article.url } target="_blank" rel="noreferrer noopener">
								<Icon icon={ page } />
								<span>{ article.title }</span>
								<Icon icon={ external } size={ 20 } />
							</a>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
}
