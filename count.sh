positive_commits=0

for i in `seq 1000 2`
do
   git --no-pager diff --name-only HEAD~$i HEAD~$(expr $i - 1) | grep "packages/" -q && (( positive_commits=positive_commits+1 ))
done

echo $positive_commits