import { createContext } from 'react';

/**
 * True spells out replies ("to Name") and likes ("Liked by 2 people") instead of an arrow and a count,
 * drops the external link icon after commenter names, and uses the lighter reply icon. Set with the `spellOutLabels` prop on Comments.
 */
export const CommentLabelsContext = createContext( false );
