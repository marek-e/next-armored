import type { PathMatcher } from './types';

export function isPathMatching(
  url: string,
  pathMatcher: PathMatcher,
  includeOption: 'every' | 'some' = 'every',
) {
  const { startWith, additionalIncludes } = pathMatcher;
  const isMatching = url.startsWith(startWith);
  if (isMatching && additionalIncludes !== undefined) {
    if (includeOption === 'every') {
      return additionalIncludes.every(path => url.includes(path));
    }
    return additionalIncludes.some(path => url.includes(path));
  }
  return isMatching;
}

export function isPathIncluded(path: string, pathToMatch: PathMatcher[]) {
  return pathToMatch.some(pathMatcher => isPathMatching(path, pathMatcher));
}
