import { createContext } from 'react';

/**
 * True spells out replies ("to Name") and likes ("Liked by 2 people") instead of an arrow and a count,
 * and drops the external link icon after commenter names. Set with the `spellOutLabels` prop on Comments.
 */
export const CommentLabelsContext = createContext( false );
