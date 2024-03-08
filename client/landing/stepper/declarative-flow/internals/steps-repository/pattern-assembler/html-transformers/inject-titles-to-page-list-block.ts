export default function injectTitlesToPageListBlock(
	patternHtml: string,
	pageTitles: string[],
	{ replaceCurrentPages }: { replaceCurrentPages: boolean }
) {
	return patternHtml.replace(
		/(?<ulTag><ul class="(?:[\s\S]*?)wp-block-page-list(?:[\s\S]*?)">)(?<currentItems>[\s\S]*?)<\/ul>/g,
		( match, ulTag, currentItems ) => {
			const items = pageTitles.map(
				( pageTitle ) => `
                    <li class="wp-block-pages-list__item">
                        <a class="wp-block-pages-list__item__link wp-block-navigation-item__content" href="#">
                            ${ pageTitle }
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
