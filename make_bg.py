from PIL import Image, ImageDraw, ImageFilter
import numpy as np, math, random
random.seed(21)
w,h=1920,1080
Y,X=np.mgrid[0:h,0:w]
t=Y/h
noise=np.random.default_rng(42).normal(0,1,(h,w))
# Twilight sky, coral break near horizon
stops=[(0,(14,24,54)),(.26,(35,54,84)),(.55,(87,112,132)),(.77,(187,160,140)),(1,(235,190,132))]
c=np.empty((h,w,3),dtype=np.float32)
for i in range(3): c[:,:,i]=np.interp(t,[s[0] for s in stops],[s[1][i] for s in stops])
# moonlike sun glows over distant towers
s=np.exp(-(((X-1430)/550)**2+((Y-450)/460)**2)*2.5)
c+=s[:,:,None]*np.array([29,23,14])
c+=noise[:,:,None]*.75
c=np.uint8(np.clip(c,0,255))
im=Image.fromarray(c,'RGB').convert('RGBA')
# filtered painterly cloud puffs
clouds=Image.new('RGBA',(w,h)); cd=ImageDraw.Draw(clouds)
for j in range(160):
 x=random.randrange(-300,w+300);y=random.randrange(60,640);rw=random.randrange(55,240);rh=random.randrange(10,38)
 cd.ellipse((x-rw,y-rh,x+rw,y+rh),fill=(244,201,179,random.randrange(2,13)))
clouds=clouds.filter(ImageFilter.GaussianBlur(55));im=Image.alpha_composite(im,clouds)
d=ImageDraw.Draw(im,'RGBA')
# distant mountain shapes
for k in range(5):
 base=int(570+k*73)
 pts=[(-100,h)]
 for x in range(-200,2200,40):
  peak=base+math.sin(x*.006+k*2)*43+math.sin(x*.015+k*8)*20+random.uniform(-11,11)
  pts.append((x,peak))
 pts.append((2200,h))
 col=[(66,93,119,125),(63,88,104,145),(50,77,86,170),(36,66,75,205),(22,49,60,240)][k]
 d.polygon(pts,fill=col)
# tiered grand citadel in horizon: ancient towers, bridge & domes
castle=Image.new('RGBA',(w,h));p=ImageDraw.Draw(castle,'RGBA'); ink=(37,58,76,175);glow=(255,207,133,155)
p.polygon([(1102,690),(1250,635),(1390,655),(1540,618),(1700,693),(1710,796),(1100,802)],fill=ink)
for cx,hei,rad in [(1170,260,39),(1300,335,45),(1450,395,58),(1580,292,36),(1670,220,28)]:
 bottom=780;top=bottom-hei
 p.rectangle((cx-rad,top,cx+rad,bottom),fill=ink)
 p.polygon([(cx-rad-14,top+8),(cx,top-rad*1.8),(cx+rad+14,top+8)],fill=(28,48,71,200))
 p.line([(cx,top-rad*1.8),(cx,top-rad*2.4)],fill=(57,78,93,180),width=5)
 for yy in range(int(top+50),750,60):
  for xx in [cx-16,cx+12]:
   p.rounded_rectangle((xx-5,yy,xx+5,yy+16),radius=4,fill=glow)
for i in range(6):
 x=1200+i*69;p.arc((x,682,x+90,810),0,180,fill=(23,44,62,210),width=22)
castle=castle.filter(ImageFilter.GaussianBlur(3));im=Image.alpha_composite(im,castle)
# scattered firefly stars
stars=Image.new('RGBA',(w,h));p=ImageDraw.Draw(stars,'RGBA')
for i in range(115):
 x=random.randrange(w);y=random.randrange(60,820);r=random.choice([1,1,2,2,3]);p.ellipse((x-r,y-r,x+r,y+r),fill=(255,226,160,random.randrange(25,120)))
stars=stars.filter(ImageFilter.GaussianBlur(.6));im=Image.alpha_composite(im,stars)
# cinematic bloom and vignette
arr=np.asarray(im.convert('RGB')).astype('float32')
ny=(Y-h*.5)/(h*.7);nx=(X-w*.5)/(w*.8);vig=np.clip(1-.38*(ny**2+nx**2),.55,1)
arr*=vig[:,:,None]
Image.fromarray(np.uint8(np.clip(arr,0,255)),'RGB').save('/mnt/data/magic-castle-premium-3d/assets/forest-sky.webp',quality=89,method=6)
