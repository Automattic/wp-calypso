.testOccurrence
| map(select(.muted == false and .currentlyMuted == false))
| map({
    build: .build.buildType.name,
    name,
    reason: (.details
      | split("\n")
      | map(select(test("^(TimeoutError|Error|expect\\(|AssertionError)")))
      | first // (.details | split("\n") | first)
      | .[0:160])
  })
