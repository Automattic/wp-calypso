import { FoldableCard } from '@automattic/components';
import { isThisASupportArticleLink } from '@automattic/urls';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { Icon, chevronRight, page } from '@wordpress/icons';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import './style.scss';

interface Source {
	title: string;
	url: string;
	content?: string;
}

interface Props {
	sources: Source[];
}

export default function SourcesDisplay( { sources }: Props ) {
	const navigate = useNavigate();
	const { pathname, state } = useLocation();
	const { getActiveSessionId } = useAgentsManagerContext();

	const uniqueSources = useMemo(
		() => [ ...new Map( sources.map( ( source ) => [ source.url, source ] ) ).values() ],
		[ sources ]
	);

	if ( uniqueSources.length === 0 ) {
		return null;
	}

	const handleSourceClick = ( e: React.MouseEvent, url: string ) => {
		const isSupportArticle = isThisASupportArticleLink( url );
		const isFromOrchestrator = pathname === '/chat';

		if ( isSupportArticle ) {
			e.preventDefault();
			navigate( `/post?link=${ encodeURIComponent( url ) }`, {
				state: isFromOrchestrator ? { ...state, sessionId: getActiveSessionId() } : state,
			} );
		}

		recordAgentsManagerTracksEvent( 'link_click', {
			href: url,
			type: isSupportArticle ? 'support_article' : 'external',
			source: isFromOrchestrator ? 'orchestrator' : 'zendesk',
		} );
	};

	return (
		<FoldableCard
			className="agents-manager-sources-display"
			summary={ __( 'Sources', '__i18n_text_domain__' ) }
			expandedSummary={ __( 'Sources', '__i18n_text_domain__' ) }
			screenReaderText={ __( 'More', '__i18n_text_domain__' ) }
			iconSize={ 16 }
			clickableHeader
			useInert
			smooth
		>
			<div className="agents-manager-sources-display__list">
				{ uniqueSources.map( ( source, index ) => (
					<a
						key={ index }
						className="agents-manager-sources-display__link"
						href={ source.url }
						rel="noopener noreferrer"
						onClick={ ( e ) => handleSourceClick( e, source.url ) }
					>
						<Icon icon={ page } />
						<span>{ decodeEntities( source.title ) }</span>
						<Icon width={ 20 } height={ 20 } icon={ chevronRight } />
					</a>
				) ) }
			</div>
		</FoldableCard>
	);
}
