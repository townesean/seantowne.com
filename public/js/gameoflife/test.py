# test.py

def hash(x, y):
	return int(((x + y)*(x + y + 1)/2) + y)

s = set()
a = []

for i in range(0, 650):
	for j in range(0, 800):
		h = hash(j, i);
		s.add(h)
		a.append(h)

print(len(s))
print(len(a))