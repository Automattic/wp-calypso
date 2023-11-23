import { HtmlTransformer } from '../types';

export default function injectTitlesToNavigationBlock( {
	patternHtml,
	pageTitles,
	options: { replaceCurrentPages },
}: HtmlTransformer ) {
	return patternHtml.replace(
		/(?<ulTag><ul class="(?:[\s\S]*?)wp-block-navigation(?:[\s\S]*?)">)(?<currentItems>[\s\S]*?)<\/ul>/g,
		( match, ulTag, currentItems ) => {
			const items = pageTitles.map(
				( pageTitle ) => `
                    <li class="wp-block-navigation-item">
                        <a class="wp-block-navigation-item__content" href="#">
                            <span class="wp-block-navigation-item__label">${ pageTitle }</span>
                        </a>
                    </li>
                `
			);
			return `
                ${ ulTag }
                ${ replaceCurrentPages ? '' : currentItems }
                ${ items.join( '' ) }
                </ul>
            `;
		}
	);
}
